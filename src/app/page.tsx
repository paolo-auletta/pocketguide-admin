'use client';

import Hero from './components/hero';
import Partners from './components/partners';
import CTA from './components/cta';
import Footer from './components/footer';

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