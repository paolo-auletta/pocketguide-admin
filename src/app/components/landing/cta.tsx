'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useTransition, useState } from "react";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  
  // Detect OS
  let os = 'Unknown';
  if (ua.indexOf('Win') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1) os = 'macOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
  
  return `${os} - ${browser}`;
}

export default function CTA() {
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);
  
    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: "",
      },
    });
  
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      const email = formRef.current?.email?.value;
      if (!email) return;
      
      startTransition(async () => {
        try {
          const device = getDeviceInfo();
          
          const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, device }),
          });
          
          if (response.ok) {
            setMessage("Successfully joined the waitlist!");
            form.reset();
          } else if (response.status === 409) {
            setMessage("You are already registered to the waitlist");
          } else {
            setMessage("Failed to join. Please try again.");
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          setMessage("An error occurred. Please try again.");
        }
      });
    };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-rose-500/5 opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Limited Early Access</span>
            </div>

            <h2 className="mb-4 text-4xl md:text-5xl font-bold">
              Ready to Transform Your Travels?
            </h2>

            <p className="mb-8 text-lg text-muted-foreground">
              Join our waitlist and be among the first to experience AI-powered travel planning. Get exclusive early access and special founder benefits.
            </p>

            <Form {...form}>
              <form
                ref={formRef}
                onSubmit={onSubmit}
                className="space-y-3 max-w-md mx-auto"
                >
                  {message && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {message}
                    </div>
                  )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="sr-only">
                        Your email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="rounded-lg gap-2 w-full group whitespace-nowrap" disabled={isPending}>
                  {isPending ? "Sending..." : "Join the Waitlist"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-xs text-muted-foreground">
              No spam, just updates about Roamlit. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}