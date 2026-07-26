import Image from 'next/image'
import { LinkButton } from '@/shared/ui/atoms/LinkButton'
import { REGISTER_ROUTE } from '@/shared/constants/global.constants'
import { LANDING_HERO_IMAGE_ALT } from '@/shared/constants/landing.constants'
import { CourierMarquee } from '@/features/Landing/CourierMarquee'

export const LandingHero = () => (
  <section id="top" className="scroll-mt-24 bg-gray-50">
    <div className="mx-auto grid max-w-[1200px] gap-14 px-7 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-22">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs uppercase tracking-widest text-primary-700">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-700" aria-hidden="true" />
          7 paqueterías · 1 plataforma
        </span>

        <h1 className="mt-6 text-pretty text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px]">
          Cotiza con varias paqueterías.
          <br />
          <span className="text-primary-700">Genera tu guía en minutos.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg text-gray-600">
          Compara tarifas de Estafeta, DHL, FedEx, UPS, Paquetexpress y más con un código postal y las medidas de tu paquete. Eliges, generas la guía y la administras desde tu panel.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <LinkButton href={REGISTER_ROUTE} type="primary">
            Crear cuenta y cotizar
          </LinkButton>
          <a href="#como-funciona" className="text-sm font-medium text-primary-700 hover:text-primary-800">
            Ver cómo funciona
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Crea tu cuenta gratis y cotiza sin compromiso.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-1.5 border-b border-gray-200 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" aria-hidden="true" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap gap-2 px-4 pt-4">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-[family-name:var(--font-geist-sans)] text-gray-600">
              72000 → 94298
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-[family-name:var(--font-geist-sans)] text-gray-600">
              2.5 kg
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-[family-name:var(--font-geist-sans)] text-gray-600">
              30 × 20 × 15 cm
            </span>
          </div>
          <Image
            src="/landing-hero-quotes.webp"
            alt={LANDING_HERO_IMAGE_ALT}
            width={1200}
            height={1138}
            priority
            sizes="(min-width: 1024px) 517px, min(560px, 100vw - 56px)"
            className="block h-auto w-full"
          />
        </div>

        <div className="hidden animate-floaty motion-reduce:animate-none sm:absolute sm:-left-6 sm:top-10 sm:block sm:rounded-lg sm:bg-accent-muted sm:px-3 sm:py-2 sm:text-xs sm:font-semibold sm:text-accent-ink sm:shadow-lg">
          folio KFT-202607-000123
        </div>
        <div className="hidden animate-floaty motion-reduce:animate-none sm:absolute sm:-right-6 sm:bottom-10 sm:flex sm:items-center sm:gap-2 sm:rounded-lg sm:bg-white sm:px-3 sm:py-2 sm:text-xs sm:font-semibold sm:text-gray-700 sm:shadow-lg">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          Guía generada
        </div>
      </div>
    </div>

    <CourierMarquee />
  </section>
)
