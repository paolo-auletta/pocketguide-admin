'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useActionState, useRef, useTransition } from "react";
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
import { submitWaitlistForm } from "../waitlist/action";
import { formSchema } from "../waitlist/schema";

type FormValues = z.infer<typeof formSchema>;

export default function CTA() {
    const [state, formAction] = useActionState(submitWaitlistForm, {
      message: "",
    });
  
    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        email: "",
      },
    });
  
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      startTransition(() => {
        formAction(new FormData(formRef.current!));
        form.reset();
      });
    };
  
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();

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
                action={formAction}
                onSubmit={onSubmit}
                className="space-y-3 max-w-md mx-auto"
                >
                  {state.message && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {state.message}
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
              No spam, just updates about PocketGuide. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}