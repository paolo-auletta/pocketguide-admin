'use client';

const legalLinks = [
  'Terms of Service',
  'Privacy Policy',
  'Cookie Settings',
  'Accessibility',
];

export default function Footer() {
  return (
    <footer className="bg-background text-foreground relative w-full pt-20 pb-10">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-foreground/10 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-foreground/60 mb-4 text-sm md:mb-0">
            © 2025 PocketGuide. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((text) => (
              <a
                key={text}
                href="#"
                className="text-foreground/60 hover:text-foreground text-sm"
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
