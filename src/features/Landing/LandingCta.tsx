import Link from 'next/link'
import { LOGIN_ROUTE, REGISTER_ROUTE } from '@/shared/constants/global.constants'

export const LandingCta = () => (
  <section className="bg-gray-50">
    <div className="mx-auto max-w-[1200px] px-7 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 px-10 py-18 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,theme(colors.primary-700/30%),transparent_45%),radial-gradient(circle_at_85%_85%,theme(colors.accent-muted/22%),transparent_45%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-pretty text-3xl font-black tracking-tight text-white">
            Tu próximo envío empieza aquí
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-gray-300">
            Crea tu cuenta, ingresa los datos de tu paquete y compara. Sin compromiso y sin instalar nada.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={REGISTER_ROUTE}
              className="flex h-10 items-center justify-center rounded-lg bg-white px-5 text-sm font-medium text-primary-700 hover:bg-gray-100"
            >
              Crear mi cuenta
            </Link>
            <Link
              href={LOGIN_ROUTE}
              className="flex h-10 items-center justify-center rounded-lg border border-white px-5 text-sm font-medium text-white hover:bg-white hover:text-gray-900"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
)
