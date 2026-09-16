import React from 'react'
import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import CoursesSection from '../components/CoursesSection.jsx'
import EquipmentSection from '../components/EquipmentSection.jsx'
import StatsBar from '../components/StatsBar.jsx'
import FeaturesSection from '../components/FeaturesSection.jsx'
import TestimonialsSection from '../components/TestimonialsSection.jsx'
import PricingSection from '../components/PricingSection.jsx'
import FAQSection from '../components/FAQSection.jsx'
import LocationSection from '../components/LocationSection.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Marquee />
      <CoursesSection />
      <EquipmentSection />
      <StatsBar />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <LocationSection />
      <CtaBanner />
    </>
  )
}
