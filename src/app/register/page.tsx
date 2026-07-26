import type { Metadata } from 'next'
import { Register } from "@/features/Login/Register/Register";

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta gratis y empieza a cotizar envíos con Estafeta, DHL, FedEx, UPS y más paqueterías desde un solo lugar.',
}

export default function RegisterPage() {
  return (
    <Register />
  )
}
