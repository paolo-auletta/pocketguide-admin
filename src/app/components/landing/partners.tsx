'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

export default function Partners() {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p 
            className="text-sm font-medium text-primary mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            Trusted Partners
          </motion.p>
          <motion.h2 
            className="mb-4 text-4xl font-bold md:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Apps and{" "}
            <span className="text-primary">
              {"Services We Work With".split(" ").map((word, idx) => (
                <span key={idx}>
                  <motion.span
                    className="inline-block"
                    initial={{ x: -10, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 + idx * 0.05 }}
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
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Roamlit integrates with the best travel and discovery platforms to bring you the most comprehensive travel planning experience.
          </motion.p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5 items-center justify-items-center max-w-5xl mx-auto">
          {/* Google Maps */}
          <motion.div 
            className="flex items-center justify-center h-16"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, delay: 0 }}
            viewport={{ once: true }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="48"
              height="48"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
          </motion.div>

          {/* The Fork */}
          <motion.div 
            className="flex items-center justify-center h-16 w-16"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <Image src="/assets/thefork.png" alt="The Fork" width={48} height={48} className="grayscale contrast-2000" />
          </motion.div>

          {/* GetYourGuide */}
          <motion.div 
            className="flex items-center justify-center h-16"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Image src="/assets/getyourguide.png" alt="GetYourGuide" width={48} height={48} className="grayscale contrast-2000" />
          </motion.div>  

          {/* Viator */}
          <motion.div 
            className="flex items-center justify-center h-16"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <Image src="/assets/viator.png" alt="Viator" width={48} height={48} className="grayscale contrast-2000" />
          </motion.div>

          {/* Dice */}
          <motion.div 
            className="flex items-center justify-center h-16 col-span-2 sm:col-span-1"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Image src="/assets/dice.png" alt="Dice" width={48} height={48} className="grayscale contrast-2000" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
