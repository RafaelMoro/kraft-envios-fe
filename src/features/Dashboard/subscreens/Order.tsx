import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, ButtonGroup, Label, Select, TextInput, ToggleSwitch } from "flowbite-react"
import clsx from "clsx"

import { LoginData } from "@/shared/types/login.types"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { useNotification } from "@/shared/hooks/useNotification"
import { getGuidesCb, getGuideStatus, generateGuideId, getGuidesDbCb, deleteGuideDbCb, hardDeleteGuideDbCb } from "@/shared/utils/guides.utils"
import { getQuoteImg } from "@/shared/utils/quotes.utils"
import { getBusinessCalendarMonthYear, toBusinessDateRange } from "@/shared/utils/date.utils"
import { GetGuidesData, GuideDbRecord, GuideUI } from "@/shared/types/guides.types"

import { GuideCard } from "@/features/Guides/ViewGuides/GuideCard"
import { GuideDbCard } from "@/features/Dashboard/subscreens/GuideDbCard"
import { GuideDbDetails } from "@/features/Dashboard/subscreens/GuideDbDetails"
import { GuideDbEditModal } from "@/features/Dashboard/subscreens/GuideDbEditModal"
import { Notification } from "@/shared/ui/atoms/Notification"
import {
  ERROR_TONE_GUIDES_SERVER_MESSAGE,
  ERROR_GE_GUIDES_SERVER_MESSAGE,
  ERROR_GUIDES_USER_MESSAGE_BASE,
  GUIDES_DB_ADMIN_INCLUDE_DELETED_LABEL,
  GUIDES_DB_ADMIN_INCLUDE_INTERNAL_PRICING_LABEL,
  GUIDES_DB_ADMIN_SCOPE_ALL_LABEL,
  GUIDES_DB_ADMIN_SCOPE_OWN_LABEL,
  GUIDES_DB_DELETE_ERROR_MESSAGE,
  GUIDES_DB_EMPTY_MESSAGE,
  GUIDES_DB_ERROR_MESSAGE,
  GUIDES_DB_FILTER_MODE_MONTH_LABEL,
  GUIDES_DB_FILTER_MODE_RANGE_LABEL,
  GUIDES_DB_RANGE_INCOMPLETE_MESSAGE,
  GUIDES_DB_RANGE_PROMPT_MESSAGE,
  GUIDES_DB_RANGE_REVERSED_MESSAGE,
} from "@/shared/constants/guides.constants"

type GuideListSource = 'external' | 'ownDb' | 'allDb'
type GuideDateFilterMode = 'month' | 'range'
type GuidesDbDateFilter =
  | { month: number; year: number; startDate?: undefined; endDate?: undefined }
  | { month?: undefined; year?: undefined; startDate: string; endDate: string }

interface OrderProps {
  userInfo: LoginData | null
}

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

const getRangeGuidance = (
  rangeStart: string,
  rangeEnd: string,
  convertedRange: ReturnType<typeof toBusinessDateRange>,
): string | null => {
  if (!rangeStart && !rangeEnd) return GUIDES_DB_RANGE_PROMPT_MESSAGE
  if (!rangeStart || !rangeEnd) return GUIDES_DB_RANGE_INCOMPLETE_MESSAGE
  if (!convertedRange) return GUIDES_DB_RANGE_REVERSED_MESSAGE
  return null
}

export const Order = ({ userInfo }: OrderProps) => {
  const { isMobileTablet, isDesktop } = useMediaQuery()
  const {
    notificationMessage,
    openNotification,
    toggleNotification,
    updateNotificationMessage,
  } = useNotification();
  const queryClient = useQueryClient();

  const isAdmin = Array.isArray(userInfo?.data?.user?.role) && userInfo?.data?.user?.role.includes('admin')

  const { month: currentBusinessMonth, year: currentBusinessYear } = getBusinessCalendarMonthYear()
  const YEARS = Array.from({ length: 5 }, (_, i) => currentBusinessYear - i)

  const [selectedSource, setSelectedSource] = useState<GuideListSource>('external')
  const [filterMode, setFilterMode] = useState<GuideDateFilterMode>('month')
  const [selectedMonth, setSelectedMonth] = useState(currentBusinessMonth)
  const [selectedYear, setSelectedYear] = useState(currentBusinessYear)
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [dbPage, setDbPage] = useState(1)
  const [dbLimit, setDbLimit] = useState<10 | 50 | 100>(10)
  const [selectedDbGuide, setSelectedDbGuide] = useState<GuideDbRecord | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editGuide, setEditGuide] = useState<GuideDbRecord | null>(null)
  const [adminScope, setAdminScope] = useState<'all' | 'own'>('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [includeInternalPricing, setIncludeInternalPricing] = useState(false)

  const [guides, setGuides] = useState<GuideUI[]>([])
  const { data, isPending, isError } = useQuery({
    queryKey: ['guides', 'external'],
    queryFn: getGuidesCb,
    enabled: selectedSource === 'external',
  })

  const convertedRange = filterMode === 'range' ? toBusinessDateRange(rangeStart, rangeEnd) : null
  const rangeGuidance = filterMode === 'range' ? getRangeGuidance(rangeStart, rangeEnd, convertedRange) : null

  const dateFilter: GuidesDbDateFilter | null =
    filterMode === 'month'
      ? { month: selectedMonth, year: selectedYear }
      : convertedRange
        ? { startDate: convertedRange.startDate, endDate: convertedRange.endDate }
        : null

  const { data: dbData, isPending: dbIsPending, isError: dbIsError } = useQuery({
    queryKey: ['guides', 'db', filterMode, selectedMonth, selectedYear, rangeStart, rangeEnd, dbPage, dbLimit],
    queryFn: () => getGuidesDbCb({ page: dbPage, limit: dbLimit, ...(dateFilter as GuidesDbDateFilter) }),
    enabled: selectedSource === 'ownDb' && dateFilter !== null,
  })

  const { data: adminDbData, isPending: adminDbIsPending, isError: adminDbIsError } = useQuery({
    queryKey: ['guides', 'db', 'admin', adminScope, includeDeleted, includeInternalPricing, filterMode, selectedMonth, selectedYear, rangeStart, rangeEnd, dbPage, dbLimit],
    queryFn: () => getGuidesDbCb({
      page: dbPage,
      limit: dbLimit,
      scope: adminScope,
      includeDeleted,
      includeInternalPricing,
      ...(dateFilter as GuidesDbDateFilter),
    }),
    enabled: selectedSource === 'allDb' && isAdmin && dateFilter !== null,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ kraftId, permanent }: { kraftId: string; permanent: boolean }) =>
      permanent ? hardDeleteGuideDbCb(kraftId) : deleteGuideDbCb(kraftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guides', 'db'] });
    },
    onError: () => {
      updateNotificationMessage(GUIDES_DB_DELETE_ERROR_MESSAGE);
      toggleNotification();
    },
  });

  const messages = data?.messages

  useEffect(() => {
    if (data) {
      const transformedGuides = data.guides.map((guide) => {
        if (guide.source === 'TONE') {
          return {
            ...guide,
            id: generateGuideId(guide),
            status: getGuideStatus(guide.status),
            hasBeenFetched: true,
            logoSrc: getQuoteImg({ courier: guide.courier, isMobile: isMobileTablet })
          }
        }

        return {
        ...guide,
        id: generateGuideId(guide),
        hasBeenFetched: guide.source === 'Pkk' ? false : true,
        logoSrc: getQuoteImg({ courier: guide.courier, isMobile: isMobileTablet })
      }
    })
      setGuides(transformedGuides)
    }
  }, [data, isMobileTablet])

  const updatePkkGuide = ({ guideId, guideUpdated}: { guideId: string, guideUpdated: GetGuidesData}) => {
    const updatedGuides = guides.map((guide) => {
      if (guide.id === guideId) {
        const formattedGuide = {
          ...guide,
          ...guideUpdated,
          hasBeenFetched: true
        }
        return formattedGuide
      }
      return guide
    })
    setGuides(updatedGuides)
  }

  useEffect(() => {
    if (messages && messages.length > 0 && selectedSource === 'external') {
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
  }, [messages, selectedSource])

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleFilterModeChange = (mode: GuideDateFilterMode) => {
    setFilterMode(mode)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleRangeStartChange = (value: string) => {
    setRangeStart(value)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleRangeEndChange = (value: string) => {
    setRangeEnd(value)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleLimitChange = (limit: 10 | 50 | 100) => {
    setDbLimit(limit)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleSelectExternalSource = () => {
    setSelectedSource('external')
    setSelectedDbGuide(null)
  }

  const handleSelectOwnDbSource = () => {
    setSelectedSource('ownDb')
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleSelectAllDbSource = () => {
    setSelectedSource('allDb')
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleAdminScopeChange = (scope: 'all' | 'own') => {
    setAdminScope(scope)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleIncludeDeletedChange = (value: boolean) => {
    setIncludeDeleted(value)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleIncludeInternalPricingChange = (value: boolean) => {
    setIncludeInternalPricing(value)
    setDbPage(1)
    setSelectedDbGuide(null)
  }

  const handleDeleteGuide = (guide: GuideDbRecord, permanent: boolean) => {
    if (permanent && !isAdmin) return
    deleteMutation.mutate({ kraftId: guide.kraftId, permanent }, {
      onSuccess: () => {
        if (selectedDbGuide) {
          setSelectedDbGuide(null)
        }
      },
    })
  }

  const handleEditGuide = (guide: GuideDbRecord) => {
    setEditGuide(guide)
    setIsEditOpen(true)
  }

  const handleCloseEditGuide = () => {
    setIsEditOpen(false)
    setEditGuide(null)
  }

  const handleUpdatedGuide = () => {
    setSelectedDbGuide(null)
  }

  const canDelete = (selectedSource === 'ownDb') || (selectedSource === 'allDb' && isAdmin)

  const activeDbData = selectedSource === 'allDb' ? adminDbData : dbData
  const activeDbIsPending = selectedSource === 'allDb' ? adminDbIsPending : dbIsPending
  const activeDbIsError = selectedSource === 'allDb' ? adminDbIsError : dbIsError

  const totalPages = activeDbData?.totalPages ?? 1

  return (
    <main className='w-full p-4 flex flex-col gap-5'>
      {openNotification && (
        <Notification
          message={notificationMessage}
          toggleNotification={toggleNotification}
        />
      )}
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      <div className="w-full flex justify-center">
        <ButtonGroup>
          <Button
            className={clsx({ "text-indigo-600 dark:text-indigo-400": selectedSource === 'external' })}
            onClick={handleSelectExternalSource}
            color="alternative"
          >
            Ver guias externas
          </Button>
          <Button
            className={clsx({ "text-indigo-600 dark:text-indigo-400": selectedSource === 'ownDb' })}
            onClick={handleSelectOwnDbSource}
            color="alternative"
          >
            Ver mis guias
          </Button>
          {isAdmin && (
            <Button
              className={clsx({ "text-indigo-600 dark:text-indigo-400": selectedSource === 'allDb' })}
              onClick={handleSelectAllDbSource}
              color="alternative"
            >
              Ver todas las guias
            </Button>
          )}
        </ButtonGroup>
      </div>

      { selectedSource === 'external' && isError && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-center tracking-tight md:col-span-2 lg:col-span-3">
            Oops!
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 md:col-span-2 lg:col-span-3">
            Ha sucedido un error. Intentelo nuevamente
          </p>
        </div>
      )}
      { selectedSource === 'external' && !isError && (
        <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-5">
          { !isPending && guides.map((guide => (
            <GuideCard key={guide.id} guide={guide} isPending={isPending} updatePkkGuide={updatePkkGuide} isDesktop={isDesktop} />
          )))}
          { isPending && Array.from({ length: 4 }).map((_, index) => (
            <GuideCard key={index} guide={null} isPending={true} updatePkkGuide={updatePkkGuide} isDesktop={isDesktop} />
          ))}
        </div>
      )}

      { (selectedSource === 'ownDb' || selectedSource === 'allDb') && selectedDbGuide && (
        <GuideDbDetails
          guide={selectedDbGuide}
          isAdmin={isAdmin}
          onBack={() => setSelectedDbGuide(null)}
          onDeleteGuide={canDelete ? handleDeleteGuide : undefined}
          onEditGuide={handleEditGuide}
        />
      )}
      { (selectedSource === 'ownDb' || selectedSource === 'allDb') && !selectedDbGuide && (
        <>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="order-filter-mode">Filtrar por:</Label>
              <Select
                id="order-filter-mode"
                className="w-40"
                value={filterMode}
                onChange={(e) => handleFilterModeChange(e.target.value as GuideDateFilterMode)}
              >
                <option value="month">{GUIDES_DB_FILTER_MODE_MONTH_LABEL}</option>
                <option value="range">{GUIDES_DB_FILTER_MODE_RANGE_LABEL}</option>
              </Select>
            </div>
            { filterMode === 'month' && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="order-month">Mes:</Label>
                  <Select
                    id="order-month"
                    className="w-32"
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center gap-2 max-w-md">
                  <Label htmlFor="order-year">Año:</Label>
                  <Select
                    id="order-year"
                    className="w-24"
                    value={selectedYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>
              </>
            ) }
            { filterMode === 'range' && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="order-range-start">Fecha inicio:</Label>
                  <TextInput
                    id="order-range-start"
                    type="date"
                    value={rangeStart}
                    onChange={(e) => handleRangeStartChange(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="order-range-end">Fecha fin:</Label>
                  <TextInput
                    id="order-range-end"
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => handleRangeEndChange(e.target.value)}
                  />
                </div>
                { rangeGuidance && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {rangeGuidance}
                  </p>
                ) }
              </>
            ) }
            <div className="flex items-center gap-2">
              <Label htmlFor="order-limit">Registros:</Label>
              <Select
                id="order-limit"
                className="w-24"
                value={dbLimit}
                onChange={(e) => handleLimitChange(Number(e.target.value) as 10 | 50 | 100)}
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>
            { selectedSource === 'allDb' && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="order-admin-scope">Alcance:</Label>
                  <Select
                    id="order-admin-scope"
                    className="w-44"
                    value={adminScope}
                    onChange={(e) => handleAdminScopeChange(e.target.value as 'all' | 'own')}
                  >
                    <option value="all">{GUIDES_DB_ADMIN_SCOPE_ALL_LABEL}</option>
                    <option value="own">{GUIDES_DB_ADMIN_SCOPE_OWN_LABEL}</option>
                  </Select>
                </div>
                <ToggleSwitch
                  checked={includeDeleted}
                  label={GUIDES_DB_ADMIN_INCLUDE_DELETED_LABEL}
                  onChange={handleIncludeDeletedChange}
                  data-testid="order-admin-include-deleted-toggle"
                />
                <ToggleSwitch
                  checked={includeInternalPricing}
                  label={GUIDES_DB_ADMIN_INCLUDE_INTERNAL_PRICING_LABEL}
                  onChange={handleIncludeInternalPricingChange}
                  data-testid="order-admin-internal-pricing-toggle"
                />
              </>
            ) }
          </div>

          { dateFilter !== null && activeDbIsError && (
            <div className="flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-center tracking-tight">
                Oops!
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                {GUIDES_DB_ERROR_MESSAGE}
              </p>
            </div>
          )}

          { dateFilter !== null && !activeDbIsError && activeDbIsPending && (
            <div className="flex justify-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
            </div>
          )}

          { dateFilter !== null && !activeDbIsError && !activeDbIsPending && activeDbData?.guides.length === 0 && (
            <div className="flex flex-col gap-5">
              <p className="text-center text-gray-600 dark:text-gray-400">
                {GUIDES_DB_EMPTY_MESSAGE}
              </p>
            </div>
          )}

          { dateFilter !== null && !activeDbIsError && !activeDbIsPending && activeDbData && activeDbData.guides.length > 0 && (
            <>
              <div className="grid gap-3">
                {activeDbData.guides.map((guide) => (
                  <GuideDbCard
                    key={guide.kraftId}
                    guide={guide}
                    isMobile={isMobileTablet}
                    isAdmin={isAdmin}
                    onViewDetails={setSelectedDbGuide}
                    onDeleteGuide={canDelete ? handleDeleteGuide : undefined}
                    onEditGuide={handleEditGuide}
                  />
                ))}
              </div>

              { totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                    disabled={dbPage === 1}
                    color="alternative"
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      onClick={() => setDbPage(page)}
                      className={clsx({ "text-indigo-600 dark:text-indigo-400": page === dbPage })}
                      color="alternative"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    onClick={() => setDbPage((p) => Math.min(totalPages, p + 1))}
                    disabled={dbPage >= totalPages}
                    color="alternative"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
      <GuideDbEditModal
        open={isEditOpen}
        onClose={handleCloseEditGuide}
        onUpdated={handleUpdatedGuide}
        guide={editGuide}
      />
    </main>
  )
}
