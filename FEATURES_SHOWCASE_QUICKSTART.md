# Features Showcase - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: Import the Component

```tsx
import { FeaturesShowcase } from "@/components/FeaturesShowcase";
```

### Step 2: Add to Your Page

```tsx
export default function Home() {
  return (
    <main>
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <FeaturesShowcase />
        </div>
      </section>
    </main>
  );
}
```

### Step 3: Done! 🎉

The component includes:
- ✅ 3 default features (Trip, Location, Chat)
- ✅ Auto-rotate every 6 seconds
- ✅ Click to switch tabs
- ✅ Keyboard navigation
- ✅ iPhone mockup
- ✅ Dark mode support
- ✅ Full accessibility

## 🎨 Customize

### Disable Auto-Rotate
```tsx
<FeaturesShowcase autoRotate={false} />
```

### Change Rotation Speed
```tsx
<FeaturesShowcase autoRotateInterval={3000} /> {/* 3 seconds */}
```

### Custom Features
```tsx
const features = [
  {
    id: "feature-1",
    label: "Feature 1",
    icon: "/assets/icon.svg",
    title: "Feature Title",
    description: "Feature description",
    screenContent: (
      <div className="flex items-center justify-center h-full bg-blue-50">
        <h3>Custom Content</h3>
      </div>
    ),
  },
];

<FeaturesShowcase features={features} />
```

## ⌨️ Keyboard Shortcuts

- **Arrow Right/Down**: Next tab
- **Arrow Left/Up**: Previous tab
- **Home**: First tab
- **End**: Last tab

## 📱 Responsive

- **Desktop**: Tabs on left, iPhone on right
- **Mobile**: Tabs above, iPhone below

## 🎯 Features

| Feature | Status |
|---------|--------|
| Click to switch | ✅ |
| Keyboard nav | ✅ |
| Auto-rotate | ✅ |
| Pause/resume | ✅ |
| Dark mode | ✅ |
| Accessibility | ✅ |
| Responsive | ✅ |

## 📚 Learn More

- **Full Docs**: `FEATURES_SHOWCASE_DOCS.md`
- **Integration**: `FEATURES_SHOWCASE_INTEGRATION.md`
- **Reference**: `FEATURES_SHOWCASE_REFERENCE.md`
- **Examples**: `src/components/FeaturesShowcaseDemo.tsx`

## 🔧 Props

```typescript
interface FeaturesShowcaseProps {
  features?: Feature[];           // Custom features
  autoRotate?: boolean;           // Enable auto-rotate (default: true)
  autoRotateInterval?: number;    // Rotation interval in ms (default: 6000)
  respectReducedMotion?: boolean; // Respect motion preferences (default: true)
}
```

## ✨ What's Included

```
✅ Main Component (FeaturesShowcase)
✅ Example Component (FeaturesShowcaseExample)
✅ Demo Component (FeaturesShowcaseDemo)
✅ iPhone Mockup
✅ 3 Default Features
✅ Auto-Rotate Logic
✅ Keyboard Navigation
✅ ARIA Labels
✅ Dark Mode
✅ Responsive Design
✅ Smooth Animations
```

## 🎓 Example Usage

### Basic
```tsx
<FeaturesShowcase />
```

### With Options
```tsx
<FeaturesShowcase
  autoRotate={true}
  autoRotateInterval={6000}
  respectReducedMotion={true}
/>
```

### In a Section
```tsx
<section className="py-16 bg-gradient-to-b from-white to-gray-50">
  <div className="max-w-6xl mx-auto px-4">
    <FeaturesShowcase />
  </div>
</section>
```

## 🧪 Test It

1. **Click tabs** - Content should fade smoothly
2. **Use keyboard** - Arrow keys should navigate
3. **Wait 6 seconds** - Tabs should auto-rotate
4. **Click a tab** - Auto-rotate should pause
5. **Wait 5 seconds** - Auto-rotate should resume
6. **Resize window** - Layout should adapt

## 🎯 Next Steps

1. ✅ Import component
2. ✅ Add to your page
3. ✅ Customize features (optional)
4. ✅ Test on desktop and mobile
5. ✅ Deploy!

## 💡 Tips

- Use high-quality SVG icons (24x24px recommended)
- Customize screen content with gradients and emojis
- Test keyboard navigation with Tab key
- Check dark mode appearance
- Verify on mobile devices

## ❓ FAQ

**Q: Can I use custom features?**
A: Yes! Pass a `features` array with your custom data.

**Q: How do I disable auto-rotate?**
A: Set `autoRotate={false}`.

**Q: Does it work on mobile?**
A: Yes! It's fully responsive and touch-friendly.

**Q: Is it accessible?**
A: Yes! WCAG 2.1 AA compliant with full keyboard support.

**Q: Can I customize the styling?**
A: Yes! All styling uses TailwindCSS classes.

**Q: Does it support dark mode?**
A: Yes! Full dark mode support included.

---

**Status**: Ready to use
**Quality**: Production-grade
**Support**: Full documentation included
