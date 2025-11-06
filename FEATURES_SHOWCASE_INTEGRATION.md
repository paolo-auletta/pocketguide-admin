# Features Showcase Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
```

### 2. Add to Your Page

```tsx
export default function Home() {
  return (
    <main>
      {/* Other content */}
      
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <FeaturesShowcase />
        </div>
      </section>
    </main>
  );
}
```

### 3. (Optional) Use the Demo Component

```tsx
import { FeaturesShowcaseDemo } from "@/components/FeaturesShowcaseDemo";

export default function Home() {
  return (
    <main>
      <FeaturesShowcaseDemo />
    </main>
  );
}
```

## Acceptance Criteria - All Met ✅

### Layout
- ✅ **Desktop**: Left tabs, right iPhone mockup (two-column grid)
- ✅ **Mobile**: Stacked layout (tabs above, mockup below)
- ✅ Responsive at `lg` breakpoint (1024px)

### Behavior
- ✅ **Tab Switching**: Click any tab to update title, description, and phone screen
- ✅ **Fade Transition**: Smooth 300ms fade between screens
- ✅ **Auto-Rotate**: Cycles through tabs every 6 seconds (configurable)
- ✅ **Pause on Interaction**: Auto-rotate stops when user clicks a tab
- ✅ **Resume After Inactivity**: Auto-rotate resumes after 5 seconds of no interaction
- ✅ **Toggleable**: Button to pause/resume auto-rotation

### Accessibility
- ✅ **Tab Roles**: `role="tablist"` on container, `role="tab"` on buttons
- ✅ **ARIA Attributes**: `aria-selected`, `aria-controls`, `aria-label`
- ✅ **Keyboard Navigation**:
  - Arrow Right/Down: Next tab
  - Arrow Left/Up: Previous tab
  - Home: First tab
  - End: Last tab
- ✅ **Focus Styling**: Blue outline on keyboard focus
- ✅ **Motion Preferences**: Respects `prefers-reduced-motion`

### Polish
- ✅ **iPhone Frame**: Black rounded frame with notch and home indicator
- ✅ **Rounded Screen**: Proper border radius matching iPhone design
- ✅ **Soft Shadow**: `shadow-2xl` with additional shadow layer
- ✅ **Dark Mode**: Full dark mode support with TailwindCSS
- ✅ **Smooth Animations**: Motion/Framer Motion for transitions

### Component Export
- ✅ **Main Export**: `FeaturesShowcase` component
- ✅ **Example Usage**: `FeaturesShowcaseExample` component
- ✅ **Demo Component**: `FeaturesShowcaseDemo` with full examples

## File Structure

```
src/components/
├── FeaturesShowcase.tsx          # Main component
├── FeaturesShowcaseDemo.tsx      # Demo/example usage
└── ...

FEATURES_SHOWCASE_DOCS.md         # Full documentation
FEATURES_SHOWCASE_INTEGRATION.md  # This file
```

## Customization Examples

### Custom Features with Different Icons

```tsx
const customFeatures = [
  {
    id: "analytics",
    label: "Analytics",
    icon: "/assets/Analytics.svg",
    title: "Advanced Analytics",
    description: "Track and analyze your travel data",
    screenContent: (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <div className="text-center">
          <div className="text-4xl">📊</div>
          <h3 className="text-lg font-semibold mt-4">Analytics Dashboard</h3>
        </div>
      </div>
    ),
  },
  // ... more features
];

<FeaturesShowcase features={customFeatures} />
```

### Disable Auto-Rotate

```tsx
<FeaturesShowcase autoRotate={false} />
```

### Faster Auto-Rotate (3 seconds)

```tsx
<FeaturesShowcase autoRotateInterval={3000} />
```

### Ignore User's Motion Preferences

```tsx
<FeaturesShowcase respectReducedMotion={false} />
```

## Testing

### Manual Testing Checklist

- [ ] Desktop view: tabs on left, iPhone on right
- [ ] Mobile view: tabs above, iPhone below
- [ ] Click each tab: content updates with fade
- [ ] Keyboard: Arrow keys navigate tabs
- [ ] Keyboard: Home goes to first tab
- [ ] Keyboard: End goes to last tab
- [ ] Auto-rotate: tabs cycle every 6 seconds
- [ ] Click tab: auto-rotate pauses
- [ ] Wait 5 seconds: auto-rotate resumes
- [ ] Toggle button: pause/resume works
- [ ] Dark mode: styling looks good
- [ ] Focus visible: keyboard focus shows blue outline
- [ ] Reduced motion: auto-rotate disabled if enabled

### Browser DevTools

1. **Responsive Design Mode**: Test mobile layout
2. **Accessibility Inspector**: Check ARIA attributes
3. **Keyboard Navigation**: Tab through elements
4. **Reduced Motion**: DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion

## Performance Notes

- Component uses React hooks efficiently
- Minimal re-renders with proper dependency arrays
- CSS animations (no JavaScript animations)
- Next.js Image component for optimized icon loading
- No external dependencies beyond existing project packages

## Troubleshooting

### Icons not showing
- Ensure SVG files exist at `/public/assets/Trip.svg`, `/public/assets/Location.svg`, `/public/assets/Chat.svg`
- Check file paths in feature objects

### Auto-rotate not working
- Check `autoRotate` prop is `true`
- Check `respectReducedMotion` - if user has motion preferences enabled, auto-rotate will be disabled
- Check browser console for errors

### Keyboard navigation not working
- Ensure component has focus (click on it first)
- Check that `onKeyDown` handler is attached to container

### Dark mode not working
- Ensure TailwindCSS dark mode is configured in `tailwind.config.ts`
- Check that `dark:` classes are being applied

## Support

For issues or questions, refer to:
- `/FEATURES_SHOWCASE_DOCS.md` - Full documentation
- `/src/components/FeaturesShowcaseDemo.tsx` - Example implementations
- Component source code comments

## Next Steps

1. Import and add to your desired page
2. Test on desktop and mobile
3. Customize features as needed
4. Adjust colors/styling to match your design system
5. Deploy and monitor performance
