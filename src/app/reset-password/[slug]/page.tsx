import type { Metadata } from 'next'
import { ResetPassword } from "@/features/Login/ResetPassword/ResetPassword"

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Crea una contraseña nueva para tu cuenta de Kraft Envíos.',
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <ResetPassword slug={slug} />
  )
}
