import { Card } from "flowbite-react"

export const AddressCardSkeleton = () => {
  return (
    <Card className="max-w-sm" data-testid="address-card-skeleton">
      <div className="flex flex-col gap-5">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white bg-slate-400 dark:bg-slate-500 animate-pulse w-full h-5 rounded-lg"></h5>
        <p className="text-gray-600 dark:text-gray-400 bg-slate-400 dark:bg-slate-500 animate-pulse w-full h-5 rounded-lg">
        </p>
        <p className="text-gray-600 dark:text-gray-400 bg-slate-400 dark:bg-slate-500 animate-pulse w-full h-5 rounded-lg">
        </p>
        <p className="text-gray-600 dark:text-gray-400 bg-slate-400 dark:bg-slate-500 animate-pulse w-full h-5 rounded-lg">
        </p>
      </div>
    </Card>
  )
}