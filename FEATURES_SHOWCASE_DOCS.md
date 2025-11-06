# Features Showcase Component

A responsive, accessible component showcasing features with interactive tabs and an iPhone mockup that syncs with the active tab.

## Features

### Layout
- **Desktop**: Two-column layout with tabs on the left and iPhone mockup on the right
- **Mobile**: Stacked layout with tabs above and mockup below
- Responsive breakpoint at `lg` (1024px)

### Interactivity
- **Click to Switch**: Click any tab to view its content
- **Keyboard Navigation**:
  - `Arrow Right` / `Arrow Down`: Next tab
  - `Arrow Left` / `Arrow Up`: Previous tab
  - `Home`: First tab
  - `End`: Last tab
- **Auto-Rotate**: Automatically cycles through tabs every 6 seconds (configurable)
- **Pause on Interaction**: Auto-rotate pauses when user clicks a tab
- **Resume After Inactivity**: Auto-rotate resumes after 5 seconds of no interaction

### Accessibility
- Full ARIA support with `role="tablist"`, `role="tab"`, and `aria-selected`
- Keyboard navigation with all standard tab patterns
- Focus-visible styling for keyboard users
- Respects `prefers-reduced-motion` media query
- Semantic HTML with proper labeling

### Animations
- Smooth fade transitions between tab content (300ms)
- Soft shadows and hover effects
- No motion if user prefers reduced motion

## Usage

### Basic Usage

```tsx
import { FeaturesShowcase } from "@/components/FeaturesShowcase";

export default function Page() {
  return (
    <div className="py-12">
      <FeaturesShowcase
        autoRotate={true}
        autoRotateInterval={6000}
        respectReducedMotion={true}
      />
    </div>
  );
}
```

### With Custom Features

```tsx
import { FeaturesShowcase } from "@/components/FeaturesShowcase";

const customFeatures = [
  {
    id: "feature-1",
    label: "Feature 1",
    icon: "/path/to/icon.svg",
    title: "Feature Title",
    description: "Feature description",
    screenContent: (
      <div className="flex items-center justify-center h-full bg-blue-50">
        <h3>Custom Screen Content</h3>
      </div>
    ),
  },
  // ... more features
];

export default function Page() {
  return (
    <FeaturesShowcase
      features={customFeatures}
      autoRotate={false}
      respectReducedMotion={true}
    />
  );
}
```

## Props

### `FeaturesShowcaseProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `features` | `Feature[]` | Default 3 features (Trip, Location, Chat) | Array of feature objects to display |
| `autoRotate` | `boolean` | `true` | Enable automatic tab rotation |
| `autoRotateInterval` | `number` | `6000` | Milliseconds between auto-rotations |
| `respectReducedMotion` | `boolean` | `true` | Disable auto-rotate if user prefers reduced motion |

### `Feature` Object

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the feature |
| `label` | `string` | Short label for the feature |
| `icon` | `string` | Path to SVG icon (24x24px recommended) |
| `title` | `string` | Feature title displayed in tab |
| `description` | `string` | Feature description displayed in tab |
| `screenContent` | `React.ReactNode` | Content to display on iPhone screen |

## Default Features

The component includes three default features:

1. **Trip** - Plan Your Trips
2. **Location** - Discover Locations
3. **Chat** - Connect & Chat

Each has a custom screen mockup with emoji and descriptive text.

## Styling

The component uses TailwindCSS and is fully themeable with dark mode support:

- **Tab Styling**: 
  - Active: Blue background with border and shadow
  - Inactive: Gray background with hover effect
- **iPhone Frame**: Black rounded frame with notch and home indicator
- **Screen Content**: Customizable with gradient backgrounds
- **Focus States**: Blue outline for keyboard navigation

## Accessibility Features

1. **ARIA Labels**: Proper roles and attributes for screen readers
2. **Keyboard Navigation**: Full keyboard support with standard patterns
3. **Focus Management**: Visible focus indicators for keyboard users
4. **Motion Preferences**: Respects `prefers-reduced-motion` setting
5. **Semantic HTML**: Proper heading hierarchy and button elements

## Browser Support

- Modern browsers with support for:
  - CSS Grid and Flexbox
  - CSS Custom Properties (dark mode)
  - Media Queries (`prefers-reduced-motion`)
  - ES6+ JavaScript

## Performance

- Minimal re-renders using React hooks
- CSS-based animations (no JavaScript animations)
- Optimized image loading with Next.js Image component
- Efficient event handling with useCallback

## Customization Examples

### Disable Auto-Rotate

```tsx
<FeaturesShowcase autoRotate={false} />
```

### Custom Rotation Speed

```tsx
<FeaturesShowcase autoRotateInterval={3000} /> {/* 3 seconds */}
```

### Ignore Motion Preferences

```tsx
<FeaturesShowcase respectReducedMotion={false} />
```

### Custom Screen Content

```tsx
const features = [
  {
    id: "demo",
    label: "Demo",
    icon: "/icon.svg",
    title: "Demo Feature",
    description: "A demo feature",
    screenContent: (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-pink-50 to-pink-100">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-2xl font-bold">Amazing Feature</h3>
          <p className="text-gray-600 mt-2">This is custom content</p>
        </div>
      </div>
    ),
  },
];

<FeaturesShowcase features={features} />
```

## Files

- **Component**: `/src/components/FeaturesShowcase.tsx`
- **Demo**: `/src/components/FeaturesShowcaseDemo.tsx`
- **Documentation**: `/FEATURES_SHOWCASE_DOCS.md`

## Integration

To use in your app:

1. Import the component:
   ```tsx
   import { FeaturesShowcase } from "@/components/FeaturesShowcase";
   ```

2. Add to your page or layout:
   ```tsx
   <FeaturesShowcase />
   ```

3. Customize as needed with props

## Testing Checklist

- [ ] Desktop layout: tabs on left, mockup on right
- [ ] Mobile layout: tabs above, mockup below
- [ ] Click tabs to switch content
- [ ] Keyboard navigation (arrows, home, end)
- [ ] Auto-rotate cycles through tabs
- [ ] Auto-rotate pauses on click
- [ ] Auto-rotate resumes after 5s inactivity
- [ ] Fade transition between tabs
- [ ] Focus visible on keyboard navigation
- [ ] Dark mode styling
- [ ] Respects prefers-reduced-motion
- [ ] iPhone mockup displays correctly
- [ ] Screen content fades smoothly
