import { ResetPassword } from "@/features/Login/ResetPassword/ResetPassword"

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