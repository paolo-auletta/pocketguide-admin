'use client';

import Image from 'next/image';

export default function Partners() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-2">Trusted Partners</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Apps and Services We Work With
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Roamlit integrates with the best travel and discovery platforms to bring you the most comprehensive travel planning experience.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5 items-center justify-items-center max-w-5xl mx-auto">
          {/* Google Maps */}
          <div className="flex items-center justify-center h-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="48"
              height="48"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
          </div>

          {/* The Fork */}
          <div className="flex items-center justify-center h-16 w-16">
            <Image src="/assets/thefork.png" alt="The Fork" width={48} height={48} className="grayscale contrast-2000" />
          </div>

          {/* GetYourGuide */}
          <div className="flex items-center justify-center h-16">
            <Image src="/assets/getyourguide.png" alt="GetYourGuide" width={48} height={48} className="grayscale contrast-2000" />
          </div>  

          {/* Viator */}
          <div className="flex items-center justify-center h-16">
            <Image src="/assets/viator.png" alt="Viator" width={48} height={48} className="grayscale contrast-2000" />
          </div>

          {/* Dice */}
          <div className="flex items-center justify-center h-16 col-span-2 sm:col-span-1">
            <Image src="/assets/dice.png" alt="Dice" width={48} height={48} className="grayscale contrast-2000" />
          </div>
        </div>
      </div>
    </section>
  );
}
