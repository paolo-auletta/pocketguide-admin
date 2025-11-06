'use client';

import Hero from './components/landing/hero';
import Partners from './components/landing/partners';
import CTA from './components/landing/cta';
import Footer from './components/landing/footer';
import { FeaturesShowcaseDemo } from './components/landing/FeaturesShowcaseDemo';
import Features from './components/landing/features';

export default function Home() {
  return (
    <div className="min-h-screen bg-background space-y-24">
      <Hero />
      <FeaturesShowcaseDemo />  
      <section id="features">
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