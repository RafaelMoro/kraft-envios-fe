import Link from 'next/link'
import { LinkButton } from '@/shared/ui/atoms/LinkButton'
import { LOGIN_ROUTE, REGISTER_ROUTE } from '@/shared/constants/global.constants'

export const LandingHeader = () => (
  <header className="sticky top-0 z-50 border-b border-gray-200 bg-gray-50/85 backdrop-blur">
    <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-7 py-4">
      <a href="#top" className="flex flex-col leading-none">
        <span className="text-2xl font-black tracking-tight text-primary-700">kraft</span>
        <span className="text-[9px] uppercase tracking-[0.14em] text-gray-600">
          Soluciones en envíos
        </span>
      </a>

      <div className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
        <a href="#como-funciona" className="hover:text-primary-700">Cómo funciona</a>
        <a href="#paqueterias" className="hover:text-primary-700">Paqueterías</a>
        <a href="#faq" className="hover:text-primary-700">Preguntas frecuentes</a>
      </div>

      <div className="flex items-center gap-3">
        <Link href={LOGIN_ROUTE} className="text-sm font-medium text-gray-700 hover:text-primary-700">
          Iniciar sesión
        </Link>
        <LinkButton href={REGISTER_ROUTE} type="primary">
          Crear cuenta
        </LinkButton>
      </div>
    </nav>
  </header>
)
