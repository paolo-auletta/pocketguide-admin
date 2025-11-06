"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "motion/react";

export function World() {
  return (
    <div className="mx-auto bg-background w-full container px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <p className="mb-4 text-4xl font-bold md:text-5xl">
          Use Roamlit to{" "}
          <span className="text-primary">
            {"explore all the world".split(" ").map((word, idx) => (
              <span key={idx}>
                <motion.span
                  className="inline-block"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  {word}
                </motion.span>
                {" "}
              </span>
            ))}
          </span>
        </p>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          We are progressively adding every possible destination you can dream of, in order to make every one of your trips come true.
        </p>
      </div>
      <WorldMap
        dots={[
          {
            start: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
        ]}
      />
    </div>
  );
}
