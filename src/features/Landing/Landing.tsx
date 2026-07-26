import { LandingHeader } from '@/features/Landing/LandingHeader'
import { LandingHero } from '@/features/Landing/LandingHero'
import { ValueBar } from '@/features/Landing/ValueBar'
import { HowItWorks } from '@/features/Landing/HowItWorks'
import { MidPageCta } from '@/features/Landing/MidPageCta'
import { PlatformFeatures } from '@/features/Landing/PlatformFeatures'
import { AudienceGrid } from '@/features/Landing/AudienceGrid'
import { CourierPanel } from '@/features/Landing/CourierPanel'
import { LandingCta } from '@/features/Landing/LandingCta'
import { LandingFooter } from '@/features/Landing/LandingFooter'

export const Landing = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
    <LandingHeader />
    <main>
      <LandingHero />
      <ValueBar />
      <HowItWorks />
      <MidPageCta />
      <PlatformFeatures />
      <AudienceGrid />
      <CourierPanel />
      <LandingCta />
    </main>
    <LandingFooter />
  </div>
)
