import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Globe, Zap } from 'lucide-react';
import Image from 'next/image';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { StickyBanner } from '@/components/ui/sticky-banner';
import { World } from './world';

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative z-10 overflow-hidden flex flex-col gap-18">
      <StickyBanner className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-blue-500 to-blue-600">
        <p className="mx-0 max-w-[90%] text-white drop-shadow-md flex gap-1">
          <a className="sm:block hidden">
            Be the first to try Roamlit once it is realeased!
          </a>
          <a className="sm:hidden block">
            Be the first to try Roamlit!
          </a>
          <a className="transition duration-200 hover:underline" onClick={() => scrollToSection('cta')}>
            Join the waitlist
          </a>
        </p>
      </StickyBanner>
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="pt-20 pb-16 md:pt-0 md:h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 w-fit rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 to-blue-400/10 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-bold text-primary">AI-Powered Travel Planning</span>
                </div>
              </div>

              {/* Heading */}
              <h1 className="mb-6 text-5xl font-bold  md:text-6xl lg:text-7xl tracking-tight">
                Plan Your Perfect <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-600 bg-clip-text text-transparent">Journey</span>
              </h1>

              {/* Description */}
              <p className="mb-10 text-lg text-muted-foreground md:text-xl leading-relaxed max-w-lg">
                Roamlit helps you discover hidden gems, find authentic local restaurants, and explore your surroundings in the perfect order—all with AI assistance at every step.
              </p>

              {/* CTA Buttons */}
              <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-center">
                <MovingBorderButton
                  borderRadius="1.75rem"
                  className="flex gap-2 px-4 py-2 group bg-gradient-to-r from-primary to-blue-400 border-white hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 font-semibold text-base"
                  onClick={() => scrollToSection('cta')}
                >
                  Join the Waitlist
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </MovingBorderButton>
                <Button 
                  onClick={() => scrollToSection('features')}
                  className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-2 transition-colors group hover:bg-transparent"
                  variant="ghost"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              {/* Stats with Icons */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-primary/10">
                <div className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-semibold text-primary">500+</div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Locations</div>
                </div>
                <div className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-semibold text-primary">24/7</div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">AI Support</div>
                </div>
                <div className="group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-semibold text-primary">100%</div>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Personalized</div>
                </div>
              </div>
            </div>

            {/* Right Visual - iPhone Mockup */}
            <div className="relative hidden lg:flex lg:justify-center lg:items-center">
              <div className="relative mx-auto">
                {/* Decorative background elements */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
                
                {/* iPhone Frame */}
                <div className="relative w-72 mx-auto">
                  {/* Outer frame */}
                  <div className="rounded-[3rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl" style={{ aspectRatio: '9/19.5' }}>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-35 h-8 bg-gray-900 rounded-b-2xl z-10" />
                    
                    {/* Screen */}
                    <div className="relative w-full h-full rounded-[2.5rem] bg-white overflow-hidden flex items-center justify-center">
                      <Image 
                        src="/assets/mobile.svg"
                        alt="Roamlit mobile app interface" 
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                        priority
                      />
                    </div>
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl -z-10 scale-110" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <World />  

    </div>
  );
}
