'use client';
import { ContactSection } from '@/components/ContactSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { PricingSection } from '@/components/PricingSection';
import { StatsSection } from '@/components/StatsSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';

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
