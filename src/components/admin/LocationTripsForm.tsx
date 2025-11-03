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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationTrip) {
      setFormData({
        trip: (locationTrip.trip as string) || '',
        location: (locationTrip.location as string) || '',
      });
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

      const method = 'POST';
      const url = '/api/admin/locations-trips';
      const body = formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save location trip');
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
        <CardTitle>Add Location to Trip</CardTitle>
        <CardDescription>Link a location to a trip</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trip *</label>
            <Select value={formData.trip} onValueChange={(value: string) => setFormData({ ...formData, trip: value })}>
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
            <Select value={formData.location} onValueChange={(value: string) => setFormData({ ...formData, location: value })}>
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
