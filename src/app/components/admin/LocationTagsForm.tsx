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

interface LocationTagsFormProps {
  locationTag?: Record<string, unknown> | null;
  tags: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LocationTagsForm({
  locationTag,
  tags,
  locations,
  onSuccess,
  onCancel,
}: LocationTagsFormProps) {
  const [formData, setFormData] = useState({
    tag: '',
    location: '',
  });

  const [originalData, setOriginalData] = useState({
    tag: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!locationTag;

  useEffect(() => {
    if (locationTag) {
      const tag = (locationTag.tag as string) || '';
      const location = (locationTag.location as string) || '';
      console.log('Loading locationTag:', { tag, location, locationTag });
      setFormData({ tag, location });
      setOriginalData({ tag, location });
    }
  }, [locationTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.tag || !formData.location) {
        throw new Error('Tag and Location are required');
      }

      // For M2M tables, editing means delete old + create new
      if (isEditing && (formData.tag !== originalData.tag || formData.location !== originalData.location)) {
        // Delete the old relationship
        const deleteUrl = `/api/admin/locations-tags?tag=${originalData.tag}&location=${originalData.location}`;
        const deleteResponse = await fetch(deleteUrl, { method: 'DELETE' });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.error || 'Failed to delete old relationship');
        }

        // Create the new relationship
        const createUrl = '/api/admin/locations-tags';
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to save location tag');
        }
      } else if (isEditing) {
        // Values unchanged - just return success (no-op)
        // The relationship already exists, so we're done
      } else {
        // Creating new relationship
        const createUrl = '/api/admin/locations-tags';
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          // Check for 409 Conflict (duplicate)
          if (createResponse.status === 409) {
            throw new Error('Location-Tag Already Exists. You can\'t create a duplicate one');
          }
          throw new Error(errorData.error || 'Failed to save location tag');
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
        <CardTitle>{isEditing ? 'Edit Tag Link' : 'Add Tag to Location'}</CardTitle>
        <CardDescription>{isEditing ? 'Update tag-location link' : 'Link a tag to a location'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tag *</label>
            <Select key={`tag-${formData.tag}`} value={formData.tag || ''} onValueChange={(value: string) => setFormData({ ...formData, tag: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
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
