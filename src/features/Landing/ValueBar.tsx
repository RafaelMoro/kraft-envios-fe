import { LANDING_VALUE_BULLETS } from '@/shared/constants/landing.constants'

export const ValueBar = () => (
  <section className="bg-gray-50">
    <div className="mx-auto grid max-w-[1200px] gap-5 px-7 py-16 sm:grid-cols-2 lg:grid-cols-3">
      {LANDING_VALUE_BULLETS.map((bullet) => (
        <div
          key={bullet.num}
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="text-xs tracking-widest text-accent-strong">{bullet.num}</span>
          <h3 className="mt-2 text-lg font-bold">{bullet.title}</h3>
          <p className="mt-2 text-pretty text-gray-600">{bullet.body}</p>
        </div>
      ))}
    </div>
  </section>
)
