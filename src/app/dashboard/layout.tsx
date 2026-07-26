import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel',
  description: 'Tu panel de Kraft Envíos: cotiza, genera guías, administra tus direcciones y consulta tu saldo.',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
