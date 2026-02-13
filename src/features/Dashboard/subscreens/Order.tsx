import { RiBuilding2Line } from "@remixicon/react"
import { useQuery } from "@tanstack/react-query"

import { LoginData } from "@/shared/types/login.types"
import { getGuidesCb } from "@/shared/utils/guides.utils"

interface OrderProps {
  userInfo: LoginData | null
}

export const Order = ({ userInfo }: OrderProps) => {
  const { data, refetch, isPending, isError } = useQuery({
    queryKey: ['guides'],
    queryFn: getGuidesCb
  })
  console.log('data', data)

  return (
    <main className='p-4 flex flex-col gap-5 justify-center items-center w-full'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <RiBuilding2Line />
      <p className="text-center">Página en construcción.</p>
    </main>
  )
}