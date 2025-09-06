import { Card } from "flowbite-react"

export const ProfitMarginCardSkeleton = () => {
  return (
    <Card data-testid="profit-margin-card-skeleton" className="mx-auto w-full lg:min-w-[387px] md:min-h-[340px]">
      <span className="text-sm text-gray-200 bg-slate-400 dark:bg-slate-500 animate-pulse w-full h-5 rounded-lg"></span>
      <h4 className="text-2xl text-gray-200 bg-slate-400 dark:bg-slate-500 animate-pulse w-full h-5 rounded-lg"></h4>
      <div className="flex flex-col gap-4">
        { Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <span className="text-lg text-gray-200 bg-slate-400 dark:bg-slate-500 animate-pulse w-20 h-5 rounded-lg"></span>
            <p className="text-base text-gray-200 bg-slate-400 dark:bg-slate-500 w-20 h-5 animate-pulse rounded-lg"></p>
          </div>
        )) }
      </div>
    </Card>
  )
}