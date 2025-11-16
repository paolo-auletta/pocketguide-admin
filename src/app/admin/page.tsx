'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CityForm } from '@/app/components/admin/CityForm';
import { LocationForm } from '@/app/components/admin/LocationForm';
import { TripForm } from '@/app/components/admin/TripForm';
import { LocationTripsForm } from '@/app/components/admin/LocationTripsForm';
import { TagForm } from '@/app/components/admin/TagForm';
import { LocationTagsForm } from '@/app/components/admin/LocationTagsForm';
import { ForeignKeyCell } from '@/app/components/admin/ForeignKeyCell';

interface TableData {
  name: string;
  count: number;
  data: Record<string, unknown>[];
}

interface TablesResponse {
  tables: Record<string, TableData>;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

interface FilterState {
  column: string | null;
  value: string;
}

export default function AdminPage() {
  const { userId, isLoaded } = useAuth();
  const [tables, setTables] = useState<Record<string, TableData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<{ table: string; row: Record<string, unknown> } | null>(null);
  const [creatingTable, setCreatingTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('cities');
  const [sortState, setSortState] = useState<Record<string, SortState>>({});
  const [filters, setFilters] = useState<Record<string, FilterState>>({});
  const [importing, setImporting] = useState<Record<string, boolean>>({});
  const [importMessages, setImportMessages] = useState<Record<string, string | null>>({});

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

      if (tableName === 'locations_tags') {
        url = `/api/admin/locations-tags?tag=${row.tag}&location=${row.location}`;
      }

      // For locations, also delete the entire folder from Supabase
      if (tableName === 'locations') {
        try {
          await fetch('/api/admin/upload-delete-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locationId: row.id }),
          });
        } catch (folderErr) {
          console.error('Failed to delete location folder:', folderErr);
          // Don't fail the whole operation if folder deletion fails
        }
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

  const detectValueType = (value: unknown): 'number' | 'date' | 'text' => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      // Check if it's a date
      if (value.includes('T') || value.includes('Z')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) return 'date';
        } catch {
          // Fall through to text
        }
      }
      return 'text';
    }
    return 'text';
  };

  const compareValues = (a: unknown, b: unknown, type: 'number' | 'date' | 'text'): number => {
    if (type === 'number') {
      const numA = Number(a) || 0;
      const numB = Number(b) || 0;
      return numA - numB;
    }
    if (type === 'date') {
      const dateA = new Date(String(a)).getTime();
      const dateB = new Date(String(b)).getTime();
      return dateA - dateB;
    }
    // text
    const strA = String(a || '').toLowerCase();
    const strB = String(b || '').toLowerCase();
    return strA.localeCompare(strB);
  };

  const handleColumnSort = (tableName: string, column: string) => {
    setSortState((prev) => {
      const currentSort = prev[tableName];
      let newDirection: SortDirection = 'asc';

      // If clicking the same column, toggle direction
      if (currentSort?.column === column) {
        if (currentSort.direction === 'asc') {
          newDirection = 'desc';
        } else {
          newDirection = null; // Clear sort
        }
      }

      return {
        ...prev,
        [tableName]: {
          column: newDirection === null ? null : column,
          direction: newDirection,
        },
      };
    });
  };

  const getFilteredData = (data: Record<string, unknown>[], tableName: string) => {
    const filter = filters[tableName];
    if (!filter?.column || filter.value.trim() === '') return data;

    const filterValueRaw = filter.value.trim();
    const filterValue = filterValueRaw.toLowerCase();

    return data.filter((row) => {
      const value = row[filter.column!];

      if (value === null || value === undefined) return false;

      if (typeof value === 'boolean') {
        if (filterValue === 'true' || filterValue === 'false') {
          const boolFilter = filterValue === 'true';
          return value === boolFilter;
        }

        if (['1', 'yes', 'y'].includes(filterValue)) return value === true;
        if (['0', 'no', 'n'].includes(filterValue)) return value === false;
        return false;
      }

      if (typeof value === 'number') {
        const numFilter = Number(filterValueRaw);
        if (!Number.isNaN(numFilter)) {
          return value === numFilter;
        }
        return String(value).toLowerCase().includes(filterValue);
      }

      if (typeof value === 'string') {
        return value.toLowerCase().includes(filterValue);
      }

      if (Array.isArray(value)) {
        return value.some((item) => String(item).toLowerCase().includes(filterValue));
      }

      return String(value).toLowerCase().includes(filterValue);
    });
  };

  const getSortedData = (data: Record<string, unknown>[], tableName: string) => {
    const sort = sortState[tableName];
    if (!sort?.column || !sort?.direction) return data;

    const sorted = [...data].sort((a, b) => {
      const valueA = a[sort.column!];
      const valueB = b[sort.column!];

      const type = detectValueType(valueA);
      let comparison = compareValues(valueA, valueB, type);

      // For dates, reverse the default (most recent first)
      if (type === 'date' && sort.direction === 'asc') {
        comparison = -comparison;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const handleCsvFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    tableName: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportMessages((prev) => ({ ...prev, [tableName]: null }));
    setImporting((prev) => ({ ...prev, [tableName]: true }));

    try {
      const text = await file.text();

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, csv: text }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        const message = result.error || 'Failed to import CSV';
        setImportMessages((prev) => ({ ...prev, [tableName]: `Error: ${message}` }));
      } else {
        const data = result.data as { inserted: number; errors?: { row: number; message: string }[] };
        if (data.errors && data.errors.length > 0) {
          const first = data.errors[0];
          setImportMessages((prev) => ({
            ...prev,
            [tableName]: `Imported ${data.inserted} rows. First error at row ${first.row}: ${first.message}`,
          }));
        } else {
          setImportMessages((prev) => ({
            ...prev,
            [tableName]: `Successfully imported ${data.inserted} rows.`,
          }));
        }

        await fetchTables();
      }
    } catch {
      setImportMessages((prev) => ({ ...prev, [tableName]: 'Error: Failed to import CSV' }));
    } finally {
      setImporting((prev) => ({ ...prev, [tableName]: false }));
      // Reset input so the same file can be selected again if needed
      event.target.value = '';
    }
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
              cities={tables.cities.data.map((c) => ({ 
                id: c.id as string, 
                name: c.name as string,
                center_latitude: c.center_latitude as number,
                center_longitude: c.center_longitude as number,
              }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
          {editingRow?.table === 'locations' && tables && (() => {
            console.log('Editing location row:', editingRow.row);
            console.log('Location guide field:', editingRow.row.guide);
            return (
              <LocationForm
                location={editingRow.row}
                cities={tables.cities.data.map((c) => ({ 
                  id: c.id as string, 
                  name: c.name as string,
                  center_latitude: c.center_latitude as number,
                  center_longitude: c.center_longitude as number,
                }))}
                onSuccess={handleFormSuccess}
                onCancel={() => setEditingRow(null)}
              />
            );
          })()}
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
          {editingRow?.table === 'locations_trips' && tables && (
            <LocationTripsForm
              locationTrip={editingRow.row}
              trips={tables.trips.data.map((t) => ({ id: t.id as string, name: t.name as string }))}
              locations={tables.locations.data.map((l) => ({ id: l.id as string, name: l.name as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRow(null)}
            />
          )}
          {creatingTable === 'tags' && (
            <TagForm
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
          {editingRow?.table === 'tags' && (
            <TagForm
              tag={editingRow.row}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRow(null)}
            />
          )}
          {creatingTable === 'locations_tags' && tables && (
            <LocationTagsForm
              tags={tables.tags.data.map((t) => ({ id: t.id as string, name: t.name as string }))}
              locations={tables.locations.data.map((l) => ({ id: l.id as string, name: l.name as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setCreatingTable(null)}
            />
          )}
          {editingRow?.table === 'locations_tags' && tables && (
            <LocationTagsForm
              locationTag={editingRow.row}
              tags={tables.tags.data.map((t) => ({ id: t.id as string, name: t.name as string }))}
              locations={tables.locations.data.map((l) => ({ id: l.id as string, name: l.name as string }))}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingRow(null)}
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
              <TabsList
                className="grid w-full gap-1 h-auto p-1 bg-muted"
                style={{ gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))` }}
              >
                {tableEntries
                  .filter(([key]) => key !== 'profiles')
                  .map(([key, table]) => (
                    <TabsTrigger key={key} value={key} className="text-xs sm:text-sm whitespace-nowrap">
                      {table.name}
                    </TabsTrigger>
                  ))}
              </TabsList>

              {tableEntries
                .filter(([key]) => key !== 'profiles')
                .map(([key, table]) => {
                  const filteredData = getFilteredData(table.data, key);
                  const sortedData = getSortedData(filteredData, key);

                  return (
                    <TabsContent key={key} value={key} className="space-y-4">
                      <div className="flex justify-between">
                        {table.data.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-muted-foreground">Filter by</span>
                              <Select
                                value={filters[key]?.column || undefined}
                                onValueChange={(column) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    [key]: {
                                      column,
                                      value: prev[key]?.value ?? '',
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="h-8 w-40">
                                  <SelectValue placeholder="Field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(table.data[0]).map((column) => (
                                    <SelectItem key={column} value={column}>
                                      {column}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                className="h-8 w-40"
                                placeholder="Value (e.g. false)"
                                value={filters[key]?.value ?? ''}
                                onChange={(e) =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    [key]: {
                                      column: prev[key]?.column ?? null,
                                      value: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-4"
                              onClick={() =>
                                setFilters((prev) => ({
                                  ...prev,
                                  [key]: { column: null, value: '' },
                                }))
                              }
                              disabled={!filters[key]?.column && !filters[key]?.value}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".csv"
                            className="text-xs max-w-[180px]"
                            onChange={(e) => handleCsvFileChange(e, key)}
                            disabled={importing[key]}
                          />
                          <Button onClick={() => setCreatingTable(key)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add {table.name}
                          </Button>
                        </div>
                      </div>

                      {importMessages[key] && (
                        <p className="text-xs text-muted-foreground">{importMessages[key]}</p>
                      )}

                      {filteredData.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No records found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(table.data[0]).map((column) => {
                                  const sort = sortState[key];
                                  const isActive = sort?.column === column;
                                  return (
                                    <TableHead
                                      key={column}
                                      className="text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                                      onClick={() => handleColumnSort(key, column)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{column}</span>
                                        {isActive &&
                                          (sort.direction === 'asc' ? (
                                            <ArrowUp className="h-3 w-3" />
                                          ) : (
                                            <ArrowDown className="h-3 w-3" />
                                          ))}
                                      </div>
                                    </TableHead>
                                  );
                                })}
                                <TableHead className="text-xs">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {Object.entries(row).map(([column, value]) => (
                                    <TableCell key={`${rowIndex}-${column}`} className="text-xs">
                                      {renderCellValue(value, column, tables)}
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
                  );
                })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderCellValue(
  value: unknown,
  columnName: string,
  tables: Record<string, TableData> | null
): React.ReactNode {
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

  // Check if this is a foreign key column and resolve it
  const foreignKeyColumns = ['city', 'location', 'trip', 'tag', 'owner'];
  if (
    typeof value === 'string' &&
    foreignKeyColumns.includes(columnName) &&
    tables &&
    value.length === 36 // UUID length
  ) {
    return <ForeignKeyCell id={value} tables={tables} />;
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
