import { LANDING_STEPS } from '@/shared/constants/landing.constants'

export const HowItWorks = () => (
  <section id="como-funciona" className="scroll-mt-24 bg-white">
    <div className="mx-auto max-w-[1200px] px-7 py-16">
      <span className="text-xs uppercase tracking-widest text-primary-700">Cómo funciona</span>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Enviar no tiene que ser complicado</h2>
      <p className="mt-2 text-pretty text-gray-600">Cuatro pasos, de la cotización a la guía generada.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_STEPS.map((step) => (
          <div key={step.num} className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-6">
            <span className="pointer-events-none absolute -right-2 -top-4 text-7xl font-black text-primary-700/10" aria-hidden="true">
              {step.num}
            </span>
            <h3 className="relative text-lg font-bold">{step.title}</h3>
            <p className="relative mt-2 text-pretty text-gray-600">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
