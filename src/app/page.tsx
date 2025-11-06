'use client';

import Hero from './components/landing/hero';
import Partners from './components/landing/partners';
import CTA from './components/landing/cta';
import Footer from './components/landing/footer';
import { AppShowcase } from './components/landing/app-showcase';
import Features from './components/landing/features';

export default function Home() {
  return (
    <div className="min-h-screen bg-background space-y-48">
      <Hero />
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 space-y-48" id="features">
        <div className="max-w-6xl mx-auto">
          <AppShowcase
            autoRotate={true}
            autoRotateInterval={6000}
            respectReducedMotion={true}
          />
        </div>
        <Features />
      </section>
      <Partners />
      <section id="cta">
        <CTA />
      </section>
      <Footer />
    </div>
  );
}