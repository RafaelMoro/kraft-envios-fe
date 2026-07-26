import { LANDING_COURIERS, LANDING_COURIER_DISCLAIMER } from '@/shared/constants/landing.constants'

export const CourierPanel = () => (
  <section id="paqueterias" className="scroll-mt-24 bg-white">
    <div className="mx-auto max-w-[1200px] px-7 py-16">
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
        <h2 className="text-3xl font-black tracking-tight">Las paqueterías que ya conoces</h2>
        <p className="mt-2 text-pretty text-gray-600">
          Trabajamos con las principales redes de entrega en México para que compares sin cambiar de plataforma.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {LANDING_COURIERS.map((courier) => (
            <span
              key={courier}
              className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-3.5 font-extrabold text-gray-800"
            >
              {courier}
            </span>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-500">{LANDING_COURIER_DISCLAIMER}</p>
      </div>
    </div>
  </section>
)
