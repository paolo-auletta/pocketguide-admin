'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CityFormProps {
  city?: Record<string, unknown> | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CityForm({ city, onSuccess, onCancel }: CityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    is_draft: true,
    center_latitude: 0,
    center_longitude: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (city) {
      setFormData({
        name: (city.name as string) || '',
        country: (city.country as string) || '',
        is_draft: (city.is_draft as boolean) ?? true,
        center_latitude: (city.center_latitude as number) || 0,
        center_longitude: (city.center_longitude as number) || 0,
      });
    }
  }, [city]);

  const fetchCoordinates = async () => {
    if (!formData.name || !formData.country) {
      setError('Please enter city name and country first');
      return;
    }

    setGeoLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          formData.name
        )}&country=${encodeURIComponent(formData.country)}&format=json&limit=1`
      );

      if (!response.ok) throw new Error('Failed to fetch coordinates');

      const data = await response.json();

      if (data.length === 0) {
        setError('City not found. Please enter coordinates manually.');
        return;
      }

      const { lat, lon } = data[0];
      setFormData((prev) => ({
        ...prev,
        center_latitude: parseFloat(lat),
        center_longitude: parseFloat(lon),
      }));
    } catch (err) {
      setError('Failed to fetch coordinates. Please enter manually.');
      console.error(err);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = city ? 'PUT' : 'POST';
      const url = '/api/admin/cities';
      const body = city ? { id: city.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save city');
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
        <CardTitle>{city ? 'Edit City' : 'Create City'}</CardTitle>
        <CardDescription>
          {city ? 'Update city information' : 'Add a new city to the database'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">City Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Paris"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g., France"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_draft"
              checked={formData.is_draft}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_draft: checked as boolean })
              }
            />
            <Label htmlFor="is_draft" className="font-normal cursor-pointer">
              Is Draft
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">Center Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={formData.center_latitude}
              onChange={(e) =>
                setFormData({ ...formData, center_latitude: parseFloat(e.target.value) })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Center Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={formData.center_longitude}
              onChange={(e) =>
                setFormData({ ...formData, center_longitude: parseFloat(e.target.value) })
              }
              placeholder="0"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={fetchCoordinates}
            disabled={geoLoading || !formData.name || !formData.country}
            className="w-full"
          >
            {geoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              'Auto-fetch Coordinates'
            )}
          </Button>

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
