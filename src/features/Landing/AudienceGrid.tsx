import { LANDING_AUDIENCES } from '@/shared/constants/landing.constants'

export const AudienceGrid = () => (
  <section className="bg-gray-50">
    <div className="mx-auto max-w-[1200px] px-7 py-16">
      <span className="text-xs uppercase tracking-widest text-primary-700">Para quién es</span>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Hecho para quien envía todos los días</h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_AUDIENCES.map((audience) => (
          <div key={audience.title} className="rounded-xl bg-gray-900 p-6">
            <h3 className="text-lg font-bold text-white">{audience.title}</h3>
            <p className="mt-2 text-pretty text-gray-300">{audience.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
