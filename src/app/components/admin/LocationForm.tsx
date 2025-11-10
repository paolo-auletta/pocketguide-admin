'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Loader2, X, Upload } from 'lucide-react';
import { LOCATION_TYPES } from '@/constants/enums';
import { getSignedImageUrl } from '@/lib/supabase-storage';
import { MapboxMap } from './MapboxMap';
import { EditorComponent, EditorHandle } from './EditorComponent';
import { OutputData } from '@editorjs/editorjs';

interface LocationFormProps {
  location?: Record<string, unknown> | null;
  cities: Array<{ id: string; name: string; center_latitude?: number; center_longitude?: number }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LocationForm({ location, cities, onSuccess, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    is_draft: true,
    description: '',
    priceLow: null as number | null,
    priceHigh: null as number | null,
    timeLow: null as number | null,
    timeHigh: null as number | null,
    type: LOCATION_TYPES[0],
    images: [] as string[],
    embedded_links: [] as string[],
    city: '',
    street: '',
    guide: null as OutputData | null,
    is_guide_premium: false,
    longitude: 0,
    latitude: 0,
  });
  const editorRef = useRef<EditorHandle | null>(null);

  const [newImage, setNewImage] = useState('');
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [tempLocationId] = useState(() => {
    // Generate a temporary UUID for uploads during creation
    return location?.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  });
  const [deletingImage, setDeletingImage] = useState(false);

  useEffect(() => {
    if (location && cities.length > 0) {
      const cityId = (location.city as string) || '';
      console.log('Setting form data - Location city:', cityId);
      console.log('Available cities:', cities.map(c => ({ id: c.id, name: c.name })));
      console.log('City ID from location:', cityId);
      
      setFormData(prev => ({
        ...prev,
        name: (location.name as string) || '',
        is_draft: (location.is_draft as boolean) ?? true,
        description: (location.description as string) || '',
        priceLow: (location.priceLow as number | null) || null,
        priceHigh: (location.priceHigh as number | null) || null,
        timeLow: (location.timeLow as number | null) || null,
        timeHigh: (location.timeHigh as number | null) || null,
        type: (location.type as string) || LOCATION_TYPES[0],
        images: (location.images as string[]) || [],
        embedded_links: (location.embedded_links as string[]) || [],
        city: cityId,
        street: (location.street as string) || '',
        guide: (location.guide as OutputData) || null,
        is_guide_premium: (location.is_guide_premium as boolean) ?? false,
        longitude: (location.longitude as number) || 0,
        latitude: (location.latitude as number) || 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.id, cities.length]);

  // Generate signed URLs for images when they change
  useEffect(() => {
    const generateSignedUrls = async () => {
      console.log('Generating signed URLs for images:', formData.images);
      const urls: Record<string, string> = {};
      
      for (const imagePath of formData.images) {
        // Only generate signed URL if it looks like a path (not already a URL)
        if (!imagePath.startsWith('http')) {
          console.log('Getting signed URL for path:', imagePath);
          const signedUrl = await getSignedImageUrl(imagePath);
          console.log('Got signed URL:', signedUrl);
          if (signedUrl) {
            urls[imagePath] = signedUrl;
          }
        }
      }
      
      console.log('Final signed URLs:', urls);
      setSignedUrls(urls);
    };

    if (formData.images.length > 0) {
      generateSignedUrls();
    }
  }, [formData.images]);

  const handleAddImage = () => {
    if (newImage.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }));
      setNewImage('');
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imagePath = formData.images[index];
    
    // Show confirmation dialog
    if (!confirm(`Are you sure you want to delete this image? This action cannot be undone.`)) {
      return;
    }

    // Only delete from Supabase if it's an existing image (has a path, not a URL)
    if (imagePath && !imagePath.startsWith('http') && location?.id) {
      setDeletingImage(true);
      try {
        const response = await fetch('/api/admin/upload-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePath }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete image from storage');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete image');
        setDeletingImage(false);
        return;
      } finally {
        setDeletingImage(false);
      }
    }

    // Remove from form data
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

  const cleanupUploadedImages = async () => {
    if (uploadedImages.length === 0 || !location?.id) return;

    try {
      await fetch('/api/admin/upload-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: location.id }), // Use location ID for cleanup
      });
    } catch (error) {
      console.error('Failed to cleanup uploaded images:', error);
    }
  };

  const handleCancel = async () => {
    // Clean up uploaded images if user cancels
    if (uploadedImages.length > 0) {
      await cleanupUploadedImages();
    }
    onCancel();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      // Use tempLocationId (either actual ID when editing, or temp ID when creating)
      formDataToSend.append('locationId', tempLocationId as string);
      
      for (let i = 0; i < files.length; i++) {
        formDataToSend.append('files', files[i]);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload images');
      }

      const data = await response.json();
      const uploadedPaths = data.paths || [];

      // Track uploaded images for cleanup if user cancels (only if creating, not editing)
      if (!location?.id) {
        setUploadedImages((prev) => [...prev, ...uploadedPaths]);
      }

      // Generate signed URLs immediately for newly uploaded images
      console.log('Generating signed URLs for newly uploaded paths:', uploadedPaths);
      const newSignedUrls: Record<string, string> = {};
      for (const path of uploadedPaths) {
        console.log('Getting signed URL for newly uploaded path:', path);
        const signedUrl = await getSignedImageUrl(path);
        console.log('Got signed URL for newly uploaded:', signedUrl);
        if (signedUrl) {
          newSignedUrls[path] = signedUrl;
        }
      }
      console.log('New signed URLs generated:', newSignedUrls);

      // Update signed URLs state
      setSignedUrls((prev) => ({ ...prev, ...newSignedUrls }));

      // Add uploaded paths to images array
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedPaths],
      }));

      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
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
      // Ensure we capture the latest editor state at submit time
      let latestGuide: OutputData | null = formData.guide;
      try {
        // @ts-expect-error access forwarded ref
        const saved = await editorRef.current?.save();
        if (saved) latestGuide = saved;
      } catch (err) {
        console.warn('Failed to save editor state at submit, using current formData.guide');
      }

      const submitData = location
        ? { id: location.id, ...formData, guide: latestGuide }
        : { ...formData, guide: latestGuide };

      // Debug: Log what's being submitted
      console.log('Submitting location data:', submitData);
      console.log('Guide data:', formData.guide);

      // If creating a new location with temp images, we'll need to move them after creation
      const isCreating = !location;
      const hasUploadedImages = uploadedImages.length > 0;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      const savedLocation = await response.json();
      const savedLocationId = savedLocation.data?.id;

      // If creating a new location with uploaded images, move them from temp folder to actual location ID folder
      if (isCreating && hasUploadedImages && savedLocationId && (tempLocationId as string).startsWith('temp-')) {
        try {
          const moveResponse = await fetch('/api/admin/upload-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromLocationId: tempLocationId,
              toLocationId: savedLocationId,
              imagePaths: uploadedImages,
            }),
          });

          if (moveResponse.ok) {
            const moveData = await moveResponse.json();
            // Update the location with the new image paths
            if (moveData.data?.newPaths && moveData.data.newPaths.length > 0) {
              await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: savedLocationId,
                  images: moveData.data.newPaths,
                }),
              });
            }
          }
        } catch (moveErr) {
          console.error('Failed to move images:', moveErr);
          // Don't fail the whole operation if image move fails
        }
      }

      // Clear uploaded images tracking after successful save
      setUploadedImages([]);
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
            <Select key={`city-${formData.city}`} value={formData.city || ''} onValueChange={(value) => setFormData({ ...formData, city: value })}>
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

          {/* Interactive Map */}
          {formData.city && (
            <div className="space-y-2">
              <MapboxMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onCoordinatesChange={(lat, lng) => {
                  setFormData({ ...formData, latitude: lat, longitude: lng });
                }}
                cityCenter={
                  cities.find((c) => c.id === formData.city)
                    ? {
                        latitude: cities.find((c) => c.id === formData.city)?.center_latitude || 0,
                        longitude: cities.find((c) => c.id === formData.city)?.center_longitude || 0,
                        name: cities.find((c) => c.id === formData.city)?.name || '',
                      }
                    : undefined
                }
              />
            </div>
          )}

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceLow">Price Low</Label>
              <Input
                id="priceLow"
                type="number"
                value={formData.priceLow ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, priceLow: e.target.value ? parseInt(e.target.value) : null })
                }
                placeholder="Optional minimum price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceHigh">Price High</Label>
              <Input
                id="priceHigh"
                type="number"
                value={formData.priceHigh ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, priceHigh: e.target.value ? parseInt(e.target.value) : null })
                }
                placeholder="Optional maximum price"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLow">Time Low (minutes)</Label>
              <Input
                id="timeLow"
                type="number"
                value={formData.timeLow ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, timeLow: e.target.value ? parseInt(e.target.value) : null })
                }
                placeholder="Optional minimum time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeHigh">Time High (minutes)</Label>
              <Input
                id="timeHigh"
                type="number"
                value={formData.timeHigh ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, timeHigh: e.target.value ? parseInt(e.target.value) : null })
                }
                placeholder="Optional maximum time"
              />
            </div>
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
            <EditorComponent
              key={`guide-editor-${(location && (location.id as string)) || 'new'}`}
              ref={editorRef}
              data={formData.guide}
              onChange={(data) => {
                console.log('Editor onChange called with data:', data);
                setFormData((prev) => ({ ...prev, guide: data }));
              }}
              placeholder="Start writing your guide..."
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
            <div className="space-y-2">
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
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    disabled={uploading}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload from Computer'}
                  </Button>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {formData.images.map((img, idx) => {
                // Use signed URL if available, otherwise use the path/URL directly
                const displayUrl = signedUrls[img] || img;
                console.log(`Image ${idx}: path="${img}", signedUrl="${signedUrls[img]}", displayUrl="${displayUrl}"`);
                
                return (
                  <div
                    key={idx}
                    className="relative group rounded overflow-hidden bg-muted aspect-square"
                  >
                    <img
                      src={displayUrl}
                      alt={`Image ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={deletingImage}
                        className="text-white hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove image"
                      >
                        {deletingImage ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <X className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
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
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
