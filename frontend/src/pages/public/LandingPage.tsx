import LandingNavbar from '../../features/landing/LandingNavbar';
import HeroSection from '../../features/landing/HeroSection';
import StatsSection from '../../features/landing/StatsSection';
import FeaturesSection from '../../features/landing/FeaturesSection';
import HowItWorksSection from '../../features/landing/HowItWorksSection';
import TestimonialsSection from '../../features/landing/TestimonialsSection';
import PricingSection from '../../features/landing/PricingSection';
import CTASection from '../../features/landing/CTASection';
import LandingFooter from '../../features/landing/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50/30 to-purple-50/30">
      <LandingNavbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
