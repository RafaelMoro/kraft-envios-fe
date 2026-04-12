import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { LoginData } from "@/shared/types/login.types"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useNotification } from "@/shared/hooks/useNotification"
import { getGuidesCb, getGuideStatus, generateGuideId } from "@/shared/utils/guides.utils"
import { getQuoteImg } from "@/shared/utils/quotes.utils"
import { GuideUI } from "@/shared/types/guides.types"

import { GuidesTable } from "@/features/Guides/ViewGuides/GuidesTable"
import { GuideCard } from "@/features/Guides/ViewGuides/GuideCard"
import { Notification } from "@/shared/ui/atoms/Notification"
import { ERROR_TONE_GUIDES_SERVER_MESSAGE, ERROR_GE_GUIDES_SERVER_MESSAGE, ERROR_GUIDES_USER_MESSAGE_BASE } from "@/shared/constants/guides.constants"

interface OrderProps {
  userInfo: LoginData | null
}

export const Order = ({ userInfo }: OrderProps) => {
  const { isMobileTablet } = useMediaQuery()
  const {
    notificationMessage,
    openNotification,
    toggleNotification,
    updateNotificationMessage,
  } = useNotification();

  const [guides, setGuides] = useState<GuideUI[]>([])
  console.log('guides', guides)
  const { data, isPending, isError } = useQuery({
    queryKey: ['guides'],
    queryFn: getGuidesCb
  })
  const messages = data?.messages

  useEffect(() => {
    if (data) {
      const transformedGuides = data.guides.map((guide) => {
        if (guide.source === 'TONE') {
          return {
            ...guide,
            id: generateGuideId(guide),
            status: getGuideStatus(guide.status),
            logoSrc: getQuoteImg({ courier: guide.courier, isMobile: isMobileTablet })
          }
        }

        return {
        ...guide,
        id: generateGuideId(guide),
        logoSrc: getQuoteImg({ courier: guide.courier, isMobile: isMobileTablet })
      }
    })
      setGuides(transformedGuides)
    }
  }, [data, isMobileTablet])

  // Handle error messages if any provider failed to fetch guides
  useEffect(() => {
    if (messages && messages.length > 0) {
      const courierNames: string[] = []
      
      if (messages.includes(ERROR_TONE_GUIDES_SERVER_MESSAGE)) {
        courierNames.push('TONE')
      }
      if (messages.includes(ERROR_GE_GUIDES_SERVER_MESSAGE)) {
        courierNames.push('GE')
      }
      
      if (courierNames.length > 0) {
        const courierList = courierNames.join(' y ')
        updateNotificationMessage(`${ERROR_GUIDES_USER_MESSAGE_BASE} ${courierList}.`)
        toggleNotification()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  return (
    <main className='w-full p-4 flex flex-col gap-5'>
      {openNotification && (
        <Notification
          message={notificationMessage}
          toggleNotification={toggleNotification}
        />
      )}
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      { isError && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-center tracking-tight md:col-span-2 lg:col-span-3">
            Oops!
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 md:col-span-2 lg:col-span-3">
            Ha sucedido un error. Intentelo nuevamente
          </p>
        </div>
      )}
      { isMobileTablet && !isError && (
        <div className="grid md:grid-cols-2 gap-5">
          { !isPending && guides.map((guide => (
            <GuideCard key={guide.id} guide={guide} isPending={isPending} />
          )))}
          { isPending && Array.from({ length: 2 }).map((_, index) => (
            <GuideCard key={index} guide={null} isPending={true} />
          ))}
        </div>
      ) }
      { !isMobileTablet && !isError && (
        <GuidesTable guides={guides ?? []} isPending={isPending} />
      )}
    </main>
  )
}