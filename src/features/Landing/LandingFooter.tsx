import Link from 'next/link'
import { DASHBOARD_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE } from '@/shared/constants/global.constants'
import { LANDING_LEGAL_NOTICE } from '@/shared/constants/landing.constants'

export const LandingFooter = () => (
  <footer className="border-t border-gray-200 bg-white">
    <div className="mx-auto max-w-[1200px] px-7 py-14">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="text-2xl font-black tracking-tight text-primary-700">kraft</span>
          <p className="mt-2 max-w-xs text-pretty text-sm text-gray-600">
            Kraft Envíos — Cotiza, envía y administra tus envíos desde un solo lugar.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Producto</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li><Link href={REGISTER_ROUTE} className="hover:text-primary-700">Cotizar</Link></li>
            <li><a href="#como-funciona" className="hover:text-primary-700">Cómo funciona</a></li>
            <li><a href="#paqueterias" className="hover:text-primary-700">Paqueterías</a></li>
            <li><a href="#faq" className="hover:text-primary-700">Preguntas frecuentes</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Cuenta</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li><Link href={LOGIN_ROUTE} className="hover:text-primary-700">Iniciar sesión</Link></li>
            <li><Link href={REGISTER_ROUTE} className="hover:text-primary-700">Crear cuenta</Link></li>
            <li><Link href={DASHBOARD_ROUTE} className="hover:text-primary-700">Mi saldo</Link></li>
          </ul>
        </div>
      </div>

      <p className="mt-10 text-pretty border-t border-gray-200 pt-6 text-xs text-gray-500">
        {LANDING_LEGAL_NOTICE}
      </p>
      <p className="mt-4 text-xs text-gray-500">© 2026 Kraft Envíos. Todos los derechos reservados.</p>
    </div>
  </footer>
)
