import { ResetPasswordCard } from "./ResetPasswordCard"

export interface ResetPasswordProps {
  slug: string
}

export const ResetPassword = ({ slug }: ResetPasswordProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col justify-center items-center gap-20 min-h-full">
        <h1 className="text-black dark:text-white text-4xl text-center font-bold">
          Crea tu nueva contraseña
        </h1>
        <ResetPasswordCard slug={slug} />
      </main>
    </div>
  )
}