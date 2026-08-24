"use client";

import { track } from "@vercel/analytics";

export function trackEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined") {
    track(eventName, properties);
  }
}

export const AnalyticsEvents = {
  templateSelected: (templateSlug: string) => 
    trackEvent("template_selected", { template_slug: templateSlug }),
  
  builderStepCompleted: (step: number, templateSlug: string) => 
    trackEvent("builder_step_completed", { step: String(step), template_slug: templateSlug }),
  
  paymentStarted: (templateSlug: string, amount: number) => 
    trackEvent("payment_started", { template_slug: templateSlug, amount: String(amount) }),
  
  paymentCompleted: (ucapanId: string, amount: number, method: string) => 
    trackEvent("payment_completed", { ucapan_id: ucapanId, amount: String(amount), method }),
  
  shareClicked: (templateSlug: string, method: "native" | "clipboard" | "qr") => 
    trackEvent("share_clicked", { template_slug: templateSlug, method }),
  
  referralShared: (code: string) => 
    trackEvent("referral_shared", { code }),
  
  newsletterSubscribed: (source: "footer" | "exit-intent") => 
    trackEvent("newsletter_subscribed", { source }),
  
  templateViewed: (templateSlug: string) => 
    trackEvent("template_viewed", { template_slug: templateSlug }),
  
  paymentMethodSelected: (method: string, templateSlug: string) => 
    trackEvent("payment_method_selected", { method, template_slug: templateSlug }),
  
  checkoutStarted: (ucapanId: string) => 
    trackEvent("checkout_started", { ucapan_id: ucapanId }),
  
  referralApplied: (code: string) => 
    trackEvent("referral_applied", { code }),
  
  referralCompleted: (referrerId: string, refereeId: string) => 
    trackEvent("referral_completed", { referrer_id: referrerId, referee_id: refereeId }),
} as const;