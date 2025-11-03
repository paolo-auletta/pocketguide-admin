'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';

interface TripFormProps {
  trip?: Record<string, unknown> | null;
  cities: Array<{ id: string; name: string }>;
  profiles: Array<{ id: string; clerk_id: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TripForm({ trip, cities, profiles, onSuccess, onCancel }: TripFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    city: '',
    number_of_adults: 0,
    number_of_children: 0,
    preferences: [] as string[],
  });

  const [newPreference, setNewPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trip) {
      setFormData({
        name: (trip.name as string) || '',
        owner: (trip.owner as string) || '',
        city: (trip.city as string) || '',
        number_of_adults: (trip.number_of_adults as number) || 0,
        number_of_children: (trip.number_of_children as number) || 0,
        preferences: (trip.preferences as string[]) || [],
      });
    }
  }, [trip]);

  const handleAddPreference = () => {
    if (newPreference.trim()) {
      setFormData((prev) => ({
        ...prev,
        preferences: [...prev.preferences, newPreference.trim()],
      }));
      setNewPreference('');
    }
  };

  const handleRemovePreference = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.owner || !formData.city) {
        throw new Error('Owner and City are required');
      }

      const method = trip ? 'PUT' : 'POST';
      const url = '/api/admin/trips';
      const body = trip ? { id: trip.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save trip');
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
        <CardTitle>{trip ? 'Edit Trip' : 'Create Trip'}</CardTitle>
        <CardDescription>
          {trip ? 'Update trip information' : 'Add a new trip to the database'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Paris Weekend"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner (Profile) *</Label>
            <Select value={formData.owner} onValueChange={(value: string) => setFormData({ ...formData, owner: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.clerk_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Select value={formData.city} onValueChange={(value: string) => setFormData({ ...formData, city: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adults">Number of Adults</Label>
            <Input
              id="adults"
              type="number"
              min="0"
              value={formData.number_of_adults}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, number_of_adults: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="children">Number of Children</Label>
            <Input
              id="children"
              type="number"
              min="0"
              value={formData.number_of_children}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, number_of_children: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label>Preferences</Label>
            <div className="flex gap-2">
              <Input
                value={newPreference}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPreference(e.target.value)}
                placeholder="Add a preference"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPreference();
                  }
                }}
              />
              <Button type="button" onClick={handleAddPreference} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferences.map((pref, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                >
                  {pref}
                  <button
                    type="button"
                    onClick={() => handleRemovePreference(idx)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
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
