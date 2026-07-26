import { LandingHeader } from '@/features/Landing/LandingHeader'
import { LandingHero } from '@/features/Landing/LandingHero'

export const Landing = () => (
  <div className="min-h-screen bg-gray-50 text-gray-900 font-[family-name:var(--font-geist-sans)]">
    <LandingHeader />
    <main>
      <LandingHero />
    </main>
  </div>
)
