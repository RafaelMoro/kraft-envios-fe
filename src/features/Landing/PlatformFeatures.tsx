import { LANDING_FEATURES, LANDING_PERKS } from '@/shared/constants/landing.constants'

export const PlatformFeatures = () => (
  <section className="bg-white">
    <div className="mx-auto max-w-[1200px] px-7 py-16">
      <span className="text-xs uppercase tracking-widest text-primary-700">La plataforma</span>
      <h2 className="mt-2 text-3xl font-black tracking-tight">Todo tu envío, en un solo panel</h2>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {LANDING_FEATURES.map((feature) => (
          <div key={feature.tag} className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <span className="inline-block rounded-md bg-accent-subtle px-2.5 py-1 text-xs uppercase tracking-widest text-accent-ink">
              {feature.tag}
            </span>
            <h3 className="mt-3 text-lg font-bold">{feature.title}</h3>
            <p className="mt-2 text-pretty text-gray-600">{feature.body}</p>
            <ul className="mt-4 space-y-2">
              {feature.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary-700" aria-hidden="true">→</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3.5">
        {LANDING_PERKS.map((perk) => (
          <span
            key={perk}
            className="rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm text-primary-700"
          >
            {perk}
          </span>
        ))}
      </div>
    </div>
  </section>
)
