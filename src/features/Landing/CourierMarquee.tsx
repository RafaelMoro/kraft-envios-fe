import { LANDING_COURIERS } from '@/shared/constants/landing.constants'

export const CourierMarquee = () => (
  <div className="overflow-hidden border-t border-gray-200 bg-gray-100 py-4">
    <div className="flex w-max gap-14 animate-marquee motion-reduce:animate-none">
      <CourierList />
      <CourierList ariaHidden />
    </div>
  </div>
)

const CourierList = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
  <div className="flex shrink-0 items-center gap-14" aria-hidden={ariaHidden || undefined}>
    {LANDING_COURIERS.map((courier, index) => (
      <span key={`${courier}-${index}`} className="flex items-center gap-14 text-lg font-bold text-gray-700">
        <span>{courier}</span>
        <span className="text-accent" aria-hidden="true">·</span>
      </span>
    ))}
  </div>
)
