'use client';
import { ContactSection } from '@/components/contact-section';
import { FeaturesSection } from '@/components/features-section';
import Footer from '@/components/footer';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { PricingSection } from '@/components/pricing-section';
import { StatsSection } from '@/components/stats-section';
import { TestimonialsSection } from '@/components/testimonials-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
