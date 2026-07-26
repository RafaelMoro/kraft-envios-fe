import type { Metadata } from 'next'
import { ForgotPassword } from "@/features/Login/ForgotPassword/ForgotPassword";

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Restablece el acceso a tu cuenta de Kraft Envíos. Te enviamos un enlace por correo para crear una contraseña nueva.',
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return (
    <ForgotPassword />
  )
}
