import { LandingHeader } from '@/features/Landing/LandingHeader'
import { LandingHero } from '@/features/Landing/LandingHero'
import { ValueBar } from '@/features/Landing/ValueBar'
import { HowItWorks } from '@/features/Landing/HowItWorks'
import { MidPageCta } from '@/features/Landing/MidPageCta'
import { PlatformFeatures } from '@/features/Landing/PlatformFeatures'
import { AudienceGrid } from '@/features/Landing/AudienceGrid'
import { CourierPanel } from '@/features/Landing/CourierPanel'
import { LandingFaq } from '@/features/Landing/LandingFaq'
import { LandingCta } from '@/features/Landing/LandingCta'
import { LandingFooter } from '@/features/Landing/LandingFooter'
import { RevealOnScroll } from '@/features/Landing/RevealOnScroll'

export const Landing = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
    <LandingHeader />
    <main>
      <LandingHero />
      <RevealOnScroll>
        <ValueBar />
      </RevealOnScroll>
      <RevealOnScroll>
        <HowItWorks />
      </RevealOnScroll>
      <RevealOnScroll>
        <MidPageCta />
      </RevealOnScroll>
      <RevealOnScroll>
        <PlatformFeatures />
      </RevealOnScroll>
      <RevealOnScroll>
        <AudienceGrid />
      </RevealOnScroll>
      <RevealOnScroll>
        <CourierPanel />
      </RevealOnScroll>
      <LandingFaq />
      <RevealOnScroll>
        <LandingCta />
      </RevealOnScroll>
    </main>
    <LandingFooter />
  </div>
)
