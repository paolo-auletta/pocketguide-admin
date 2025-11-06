'use client';

import Hero from './components/landing/hero';
import Partners from './components/landing/partners';
import CTA from './components/landing/cta';
import Footer from './components/landing/footer';
import { World } from './components/landing/world';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Partners />
      <section id="cta">
        <CTA />
      </section>
      <Footer />
    </div>
  );
}