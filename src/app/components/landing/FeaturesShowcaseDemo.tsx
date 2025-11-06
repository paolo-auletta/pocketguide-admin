"use client";

import { FeaturesShowcase } from "./FeaturesShowcase";
import { Zap, Lightbulb } from "lucide-react";

/**
 * Demo page showing the FeaturesShowcase component in action
 * 
 * Features:
 * - Desktop: Two-column layout (tabs on left, iPhone mockup on right)
 * - Mobile: Stacked layout (tabs above, mockup below)
 * - Auto-rotate every 6 seconds with pause on focus
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - Respects prefers-reduced-motion for accessibility
 * - Smooth fade transitions between tabs
 */
export function FeaturesShowcaseDemo() {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <FeaturesShowcase
          autoRotate={true}
          autoRotateInterval={6000}
          respectReducedMotion={true}
        />
      </div>
    </section>
  );
}

/**
 * Example of customizing the component with different features
 */
export function CustomFeaturesShowcase() {
  const customFeatures = [
    {
      id: "custom-1",
      label: "Feature 1",
      icon: "/assets/Trip.svg",
      lucideIcon: <Zap className="w-5 h-5" />,
      title: "Custom Feature 1",
      description: "Description for custom feature 1",
      fullDescription: "This is a more detailed description of the first custom feature. It provides additional context and information about what this feature does.",
      screenContent: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Custom Feature 1
            </h3>
          </div>
        </div>
      ),
    },
    {
      id: "custom-2",
      label: "Feature 2",
      icon: "/assets/Location.svg",
      lucideIcon: <Lightbulb className="w-5 h-5" />,
      title: "Custom Feature 2",
      description: "Description for custom feature 2",
      fullDescription: "This is a more detailed description of the second custom feature. It explains the benefits and use cases for this particular functionality.",
      screenContent: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <div className="text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Custom Feature 2
            </h3>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <FeaturesShowcase
          features={customFeatures}
          autoRotate={false}
          respectReducedMotion={true}
        />
      </div>
    </section>
  );
}
