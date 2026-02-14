import { useQuery } from "@tanstack/react-query"

import { LoginData } from "@/shared/types/login.types"
import { getGuidesCb } from "@/shared/utils/guides.utils"
import { GuidesTable } from "@/features/Guides/ViewGuides/GuidesTable"
import { GuideUI } from "@/shared/types/guides.types"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { GuideCard } from "@/features/Guides/ViewGuides/GuideCard"
import { useEffect, useState } from "react"
import { getQuoteImg } from "@/shared/utils/quotes.utils"

interface OrderProps {
  userInfo: LoginData | null
}

export const Order = ({ userInfo }: OrderProps) => {
  const { isMobileTablet } = useMediaQuery()
  const [guides, setGuides] = useState<GuideUI[]>([])
  const { data, isPending, isError } = useQuery({
    queryKey: ['guides'],
    queryFn: getGuidesCb
  })

  useEffect(() => {
    if (data) {
      const transformedGuides = data.map((guide) => ({
        ...guide,
        logoSrc: getQuoteImg({ courier: guide.courier, isMobile: isMobileTablet })
      }))
      setGuides(transformedGuides)
    }
  }, [data, isMobileTablet])

  return (
    <main className='w-full p-4 flex flex-col gap-5'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      { isMobileTablet && (
        <div className="grid md:grid-cols-2 gap-5">
          { guides.map((guide => (
            <GuideCard key={guide.trackingNumber} guide={guide} />
          )))}
        </div>
      ) }
      { !isMobileTablet && (
        <GuidesTable guides={guides ?? []} isPending={isPending} />
      )}
    </main>
  )
}