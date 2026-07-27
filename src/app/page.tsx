import type { Metadata } from 'next'
import { Landing } from '@/features/Landing/Landing'

export const metadata: Metadata = {
  title: { absolute: 'Kraft Envíos | Cotiza y genera guías con varias paqueterías' },
  description: 'Compara precios de Estafeta, DHL, FedEx, UPS y más en una sola cotización. Genera tu guía y administra todos tus envíos desde un solo lugar.',
  openGraph: {
    title: 'Un solo lugar para cotizar, enviar y administrar tus envíos',
    description: 'Kraft Envíos reúne varias paqueterías en una plataforma: cotizas, eliges el precio que te conviene y generas tu guía en minutos.',
    type: 'website',
    locale: 'es_MX',
  },
}

export default function HomePage() {
  return <Landing />
}
