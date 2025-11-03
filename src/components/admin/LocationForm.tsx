'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { LOCATION_TYPES } from '@/constants/enums';

interface LocationFormProps {
  location?: Record<string, unknown> | null;
  cities: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LocationForm({ location, cities, onSuccess, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    is_draft: true,
    description: '',
    type: LOCATION_TYPES[0],
    images: [] as string[],
    embedded_links: [] as string[],
    tags: [] as string[],
    city: '',
    street: '',
    guide: '',
    is_guide_premium: false,
    longitude: 0,
    latitude: 0,
  });

  const [newImage, setNewImage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      setFormData({
        name: (location.name as string) || '',
        is_draft: (location.is_draft as boolean) ?? true,
        description: (location.description as string) || '',
        type: (location.type as string) || LOCATION_TYPES[0],
        images: (location.images as string[]) || [],
        embedded_links: (location.embedded_links as string[]) || [],
        tags: (location.tags as string[]) || [],
        city: (location.city as string) || '',
        street: (location.street as string) || '',
        guide: (location.guide as string) || '',
        is_guide_premium: (location.is_guide_premium as boolean) ?? false,
        longitude: (location.longitude as number) || 0,
        latitude: (location.latitude as number) || 0,
      });
    }
  }, [location]);

  const handleAddImage = () => {
    if (newImage.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }));
      setNewImage('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        embedded_links: [...prev.embedded_links, newLink.trim()],
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      embedded_links: prev.embedded_links.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.city) {
        throw new Error('City is required');
      }

      const method = location ? 'PUT' : 'POST';
      const url = '/api/admin/locations';
      const body = location ? { id: location.id, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>{location ? 'Edit Location' : 'Create Location'}</CardTitle>
        <CardDescription>
          {location ? 'Update location information' : 'Add a new location to the database'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Eiffel Tower"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
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
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Street</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder="Street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, latitude: parseFloat(e.target.value) })
              }
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, longitude: parseFloat(e.target.value) })
              }
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guide">Guide</Label>
            <Input
              id="guide"
              value={formData.guide}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, guide: e.target.value })
              }
              placeholder="Guide information"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_guide_premium"
              checked={formData.is_guide_premium}
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                setFormData({ ...formData, is_guide_premium: checked === true })
              }
            />
            <Label htmlFor="is_guide_premium" className="font-normal cursor-pointer">
              Is Guide Premium
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_draft"
              checked={formData.is_draft}
              onCheckedChange={(checked: boolean | 'indeterminate') =>
                setFormData({ ...formData, is_draft: checked === true })
              }
            />
            <Label htmlFor="is_draft" className="font-normal cursor-pointer">
              Is Draft
            </Label>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImage(e.target.value)}
                placeholder="Paste image URL"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <Button type="button" onClick={handleAddImage} variant="outline">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <img
                    src={img}
                    alt={`Image ${idx}`}
                    className="h-8 w-8 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xs truncate flex-1 mx-2">{img}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Embedded Links */}
          <div className="space-y-2">
            <Label>Embedded Links</Label>
            <div className="flex gap-2">
              <Input
                value={newLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLink(e.target.value)}
                placeholder="Paste link URL"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <Button type="button" onClick={handleAddLink} variant="outline">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.embedded_links.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs truncate flex-1">{link}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-blue-600 hover:text-blue-800"
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
