import Link from 'next/link'
import { REGISTER_ROUTE } from '@/shared/constants/global.constants'

export const MidPageCta = () => (
  <section className="bg-gray-50">
    <div className="mx-auto max-w-[1200px] px-7 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-primary-700 p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,theme(colors.accent-muted/22%),transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-pretty text-xl font-bold text-white">
            Deja de cotizar paquetería por paquetería.
          </p>
          <Link
            href={REGISTER_ROUTE}
            className="relative flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-primary-700 hover:bg-gray-100"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  </section>
)
