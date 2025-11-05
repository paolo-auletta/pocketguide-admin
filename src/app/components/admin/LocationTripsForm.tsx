'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface LocationTripsFormProps {
  locationTrip?: Record<string, unknown> | null;
  trips: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LocationTripsForm({
  locationTrip,
  trips,
  locations,
  onSuccess,
  onCancel,
}: LocationTripsFormProps) {
  const [formData, setFormData] = useState({
    trip: '',
    location: '',
  });

  const [originalData, setOriginalData] = useState({
    trip: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!locationTrip;

  useEffect(() => {
    if (locationTrip) {
      const trip = (locationTrip.trip as string) || '';
      const location = (locationTrip.location as string) || '';
      setFormData({ trip, location });
      setOriginalData({ trip, location });
    }
  }, [locationTrip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.trip || !formData.location) {
        throw new Error('Trip and Location are required');
      }

      // For M2M tables, editing means delete old + create new
      if (isEditing && (formData.trip !== originalData.trip || formData.location !== originalData.location)) {
        // Delete the old relationship
        const deleteUrl = `/api/admin/locations-trips?trip=${originalData.trip}&location=${originalData.location}`;
        const deleteResponse = await fetch(deleteUrl, { method: 'DELETE' });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.error || 'Failed to delete old relationship');
        }

        // Create the new relationship
        const createUrl = '/api/admin/locations-trips';
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to save location trip');
        }
      } else if (isEditing) {
        // Values unchanged - just return success (no-op)
        // The relationship already exists, so we're done
      } else {
        // Creating new relationship
        const createUrl = '/api/admin/locations-trips';
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          // Check for 409 Conflict (duplicate)
          if (createResponse.status === 409) {
            throw new Error('Location-Trip Already Exists. You can\'t create a duplicate one');
          }
          throw new Error(errorData.error || 'Failed to save location trip');
        }
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Trip Link' : 'Add Location to Trip'}</CardTitle>
        <CardDescription>{isEditing ? 'Update trip-location link' : 'Link a location to a trip'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trip *</label>
            <Select key={`trip-${formData.trip}`} value={formData.trip || ''} onValueChange={(value: string) => setFormData({ ...formData, trip: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location *</label>
            <Select key={`location-${formData.location}`} value={formData.location || ''} onValueChange={(value: string) => setFormData({ ...formData, location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
