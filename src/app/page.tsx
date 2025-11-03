'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { CityForm } from '@/components/admin/CityForm';
import { LocationForm } from '@/components/admin/LocationForm';
import { TripForm } from '@/components/admin/TripForm';
import { LocationTripsForm } from '@/components/admin/LocationTripsForm';

interface TableData {
  name: string;
  count: number;
  data: Record<string, unknown>[];
}

interface TablesResponse {
  tables: Record<string, TableData>;
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth();
  const [tables, setTables] = useState<Record<string, TableData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<{ table: string; row: Record<string, unknown> } | null>(null);
  const [creatingTable, setCreatingTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('cities');

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      if (!response.ok) {
        if (response.status === 403) {
          setError('You do not have admin access');
        } else if (response.status === 401) {
          setError('You must be signed in');
        } else {
          setError('Failed to fetch database contents');
        }
        return;
      }
      const data: TablesResponse = await response.json();
      setTables(data.tables);
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      setError('You must be signed in to access this page');
      setLoading(false);
      return;
    }

    fetchTables();
  }, [userId, isLoaded]);

  const handleDelete = async (tableName: string, row: Record<string, unknown>) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      let url = `/api/admin/${tableName}?id=${row.id}`;

      if (tableName === 'locations_trips') {
        url = `/api/admin/locations-trips?trip=${row.trip}&location=${row.location}`;
      }

      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      await fetchTables();
    } catch (err) {
      alert('Failed to delete record');
      console.error(err);
    }
  };

  const handleFormSuccess = async () => {
    setEditingRow(null);
    setCreatingTable(null);
    await fetchTables();
    // Keep the active tab when form closes
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tables) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No database tables found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tableEntries = Object.entries(tables);
  
  // Update activeTab when editing or creating
  if ((editingRow || creatingTable) && activeTab !== (editingRow?.table || creatingTable)) {
    setActiveTab(editingRow?.table || creatingTable || 'cities');
  }

  // Show form modal if editing or creating
  if (editingRow || creatingTable) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          {creatingTable === 'cities' && (
            <CityForm
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
          {editingRow?.table === 'cities' && (
            <CityForm
              city={editingRow.row}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRow(null)}
            />
          )}
          {creatingTable === 'locations' && tables && (
            <LocationForm
              cities={tables.cities.data.map((c) => ({ id: c.id as string, name: c.name as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
          {editingRow?.table === 'locations' && tables && (
            <LocationForm
              location={editingRow.row}
              cities={tables.cities.data.map((c) => ({ id: c.id as string, name: c.name as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRow(null)}
            />
          )}
          {creatingTable === 'trips' && tables && (
            <TripForm
              cities={tables.cities.data.map((c) => ({ id: c.id as string, name: c.name as string }))}
              profiles={tables.profiles.data.map((p) => ({ id: p.id as string, clerk_id: p.clerk_id as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
          {editingRow?.table === 'trips' && tables && (
            <TripForm
              trip={editingRow.row}
              cities={tables.cities.data.map((c) => ({ id: c.id as string, name: c.name as string }))}
              profiles={tables.profiles.data.map((p) => ({ id: p.id as string, clerk_id: p.clerk_id as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRow(null)}
            />
          )}
          {creatingTable === 'locations_trips' && tables && (
            <LocationTripsForm
              trips={tables.trips.data.map((t) => ({ id: t.id as string, name: t.name as string }))}
              locations={tables.locations.data.map((l) => ({ id: l.id as string, name: l.name as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6 my-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Database</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tableEntries.filter(([key]) => key !== 'profiles').map(([key, table]) => (
            <Card key={key}>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">{table.count}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {table.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(tableEntries.filter(([key]) => key !== 'profiles').length, 5)}, minmax(0, 1fr))` }}>
                {tableEntries.filter(([key]) => key !== 'profiles').map(([key, table]) => (
                  <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                    {table.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tableEntries.filter(([key]) => key !== 'profiles').map(([key, table]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCreatingTable(key)}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add {table.name}
                    </Button>
                  </div>

                  {table.data.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No records found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(table.data[0]).map((column) => (
                              <TableHead key={column} className="text-xs">
                                {column}
                              </TableHead>
                            ))}
                            <TableHead className="text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {Object.entries(row).map(([column, value]) => (
                                <TableCell key={`${rowIndex}-${column}`} className="text-xs">
                                  {renderCellValue(value)}
                                </TableCell>
                              ))}
                              <TableCell className="text-xs space-x-2 flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingRow({ table: key, row })}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(key, row)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  if (typeof value === 'boolean') {
    return (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? 'true' : 'false'}
      </Badge>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, idx) => (
          <Badge key={idx} variant="outline" className="text-xs">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    return <span className="text-muted-foreground text-xs">[Object]</span>;
  }

  // Format dates
  if (typeof value === 'string' && (value.includes('T') || value.includes('Z'))) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const formatted = date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        return <span className="text-xs whitespace-nowrap">{formatted}</span>;
      }
    } catch {
      // If date parsing fails, fall through to string handling
    }
  }

  if (typeof value === 'string' && value.length > 50) {
    return <span title={value}>{value.substring(0, 50)}...</span>;
  }

  return String(value);
}
