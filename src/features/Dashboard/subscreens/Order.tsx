import { useQuery } from "@tanstack/react-query"

import { LoginData } from "@/shared/types/login.types"
import { getGuidesCb } from "@/shared/utils/guides.utils"
import { GuidesTable } from "@/features/Guides/ViewGuides/GuidesTable"

interface OrderProps {
  userInfo: LoginData | null
}

export const Order = ({ userInfo }: OrderProps) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ['guides'],
    queryFn: getGuidesCb
  })

  return (
    <main className='w-full p-4 flex flex-col gap-5'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <GuidesTable guides={data ?? []} />
    </main>
  )
}