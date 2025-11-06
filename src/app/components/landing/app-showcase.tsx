"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Plane, MapPin, MessageCircle } from "lucide-react";

interface Feature {
  id: string;
  label: string;
  icon: string;
  lucideIcon: React.ReactNode;
  title: string;
  description: string;
  fullDescription: string;
  screenContent: React.ReactNode;
}

interface AppShowcaseProps {
  features?: Feature[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  respectReducedMotion?: boolean;
}

const defaultFeatures: Feature[] = [
  {
    id: "trip",
    label: "Trip",
    icon: "/assets/Trip.svg",
    lucideIcon: <Plane className="w-5 h-5" />,
    title: "Plan Your Trips",
    description: "Organize and manage all your travel adventures in one place.",
    fullDescription: "Create detailed itineraries, set budgets, and collaborate with travel companions. Keep all your trip details organized from flights to accommodations.",
    screenContent: (
      <div className="w-full h-full flex items-center justify-center">
        <Image
          src="/assets/Trip.svg"
          alt="Trip"
          width={393}
          height={852}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
  {
    id: "location",
    label: "Location",
    icon: "/assets/Location.svg",
    lucideIcon: <MapPin className="w-5 h-5" />,
    title: "Discover Locations",
    description: "Find and explore amazing places around the world.",
    fullDescription: "Explore curated destinations, read reviews from other travelers, and discover hidden gems. Save your favorite locations and get personalized recommendations.",
    screenContent: (
      <div className="w-full h-full flex items-center justify-center">
        <Image
          src="/assets/Location.svg"
          alt="Location"
          width={393}
          height={852}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
  {
    id: "chat",
    label: "Chat",
    icon: "/assets/Chat.svg",
    lucideIcon: <MessageCircle className="w-5 h-5" />,
    title: "Connect & Chat",
    description: "Share experiences and chat with fellow travelers.",
    fullDescription: "Connect with a community of travelers, share tips and recommendations, and make new friends. Exchange stories, photos, and local insights in real-time.",
    screenContent: (
      <div className="w-full h-full flex items-center justify-center">
        <Image
          src="/assets/Chat.svg"
          alt="Chat"
          width={393}
          height={852}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
];

export function AppShowcase({
  features = defaultFeatures,
  autoRotate = true,
  autoRotateInterval = 6000,
  respectReducedMotion = true,
}: AppShowcaseProps) {
  const [activeTabId, setActiveTabId] = useState(features[0].id);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotionRef = useRef(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (!respectReducedMotion) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches) {
        setIsAutoRotating(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [respectReducedMotion]);

  // Auto-rotate tabs
  useEffect(() => {
    if (!isAutoRotating || prefersReducedMotionRef.current) {
      return;
    }

    const clearExistingTimeout = () => {
      if (autoRotateTimeoutRef.current) {
        clearTimeout(autoRotateTimeoutRef.current);
      }
    };

    clearExistingTimeout();

    autoRotateTimeoutRef.current = setTimeout(() => {
      setActiveTabId((prevId) => {
        const currentIndex = features.findIndex((f) => f.id === prevId);
        const nextIndex = (currentIndex + 1) % features.length;
        return features[nextIndex].id;
      });
    }, autoRotateInterval);

    return clearExistingTimeout;
  }, [isAutoRotating, activeTabId, features, autoRotateInterval]);

  // Pause auto-rotate on user interaction
  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setIsAutoRotating(false);
  }, []);

  // Resume auto-rotate after inactivity
  useEffect(() => {
    if (!autoRotate || isAutoRotating) return;

    const inactivityTimeout = setTimeout(() => {
      setIsAutoRotating(true);
    }, 5000);

    return () => clearTimeout(inactivityTimeout);
  }, [isAutoRotating, autoRotate]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = features.findIndex((f) => f.id === activeTabId);

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % features.length;
          handleTabClick(features[nextIndex].id);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + features.length) % features.length;
          handleTabClick(features[prevIndex].id);
          break;
        case "Home":
          e.preventDefault();
          handleTabClick(features[0].id);
          break;
        case "End":
          e.preventDefault();
          handleTabClick(features[features.length - 1].id);
          break;
        default:
          break;
      }
    },
    [features, activeTabId, handleTabClick]
  );

  const activeFeature = features.find((f) => f.id === activeTabId) || features[0];

  // Handle focus/blur to pause/resume auto-rotation
  const handleFocus = useCallback(() => {
    setIsAutoRotating(false);
  }, []);

  const handleBlur = useCallback(() => {
    if (autoRotate) {
      setIsAutoRotating(true);
    }
  }, [autoRotate]);

  return (
    <div
      className="w-full"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="region"
      aria-label="Features showcase"
      tabIndex={0}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Tabs Section */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <motion.h2 
              className="mb-4 text-4xl font-bold md:text-5xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Everything for Your{" "}
              <span className="text-primary">
                {"Journey".split(" ").map((word, idx) => (
                  <span key={idx}>
                    <motion.span
                      className="inline-block"
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      {word}
                    </motion.span>
                    {" "}
                  </span>
                ))}
              </span>
            </motion.h2>
            <motion.p 
              className="mx-auto max-w-2xl text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Discover a complete travel companion that helps you plan, explore, and connect with fellow adventurers around the world.
            </motion.p>
          </div>

          {/* Tab Buttons */}
          <div
            className="flex flex-col gap-3"
            role="tablist"
            aria-label="Feature tabs"
          >
            {features.map((feature, idx) => (
              <motion.button
                key={feature.id}
                onClick={() => handleTabClick(feature.id)}
                role="tab"
                aria-selected={activeTabId === feature.id}
                aria-controls={`panel-${feature.id}`}
                id={`tab-${feature.id}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 text-left",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
                  activeTabId === feature.id
                    ? "bg-blue-50 dark:bg-blue-950 border-2 border-blue-500 shadow-md"
                    : "bg-gray-50 dark:bg-gray-900 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <motion.div 
                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400"
                  whileHover={{ rotate: 10 }}
                >
                  {feature.lucideIcon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Feature Details */}
          <div className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {activeFeature.fullDescription}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* iPhone Mockup Section */}
        <motion.div 
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <IPhoneMockup activeFeature={activeFeature} />
        </motion.div>
      </div>
    </div>
  );
}

interface IPhoneMockupProps {
  activeFeature: Feature;
}

function IPhoneMockup({ activeFeature }: IPhoneMockupProps) {
  return (
    <motion.div 
      className="relative w-full max-w-xs"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* iPhone Frame */}
      <div className="relative aspect-[9/19.5] bg-black rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-black">
        {/* Screen Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20" />

        {/* Screen Content */}
        <div className="relative w-full h-full bg-white dark:bg-gray-950 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {activeFeature.screenContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-20" />
      </div>

      {/* Soft Shadow */}
      <div className="absolute inset-0 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] pointer-events-none" />
    </motion.div>
  );
}

// Example usage component
export function AppShowcaseExample() {
  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AppShowcase
          autoRotate={true}
          autoRotateInterval={6000}
          respectReducedMotion={true}
        />
      </div>
    </div>
  );
}
