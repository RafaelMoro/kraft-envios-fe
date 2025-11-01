import clsx from "clsx"

interface StepperProps {
  steps: Set<string>
  currentStep: number
  showNewStepper?: boolean
}

const CheckSVG = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

export const Stepper = ({ steps, currentStep, showNewStepper }: StepperProps) => {
  const stepsArray = Array.from(steps)

  const circleClass = (index: number) => clsx(
    'w-8 h-8 rounded-full border flex items-center justify-center',
    {'bg-green-800 dark:bg-green-600 border-green-800 dark:border-green-600': currentStep > index + 1},
    {'bg-blue-800 border-blue-800': currentStep === index + 1}
  )
  const spanNumberClass = (index: number) => clsx(
    {'text-white': currentStep === index + 1}
  )
  const h3Class = (index: number) => clsx(
    'text-sm font-medium',
    {'text-blue-800 dark:text-blue-400': currentStep === index + 1}
  )

  if (showNewStepper) {
    return (
      <ul className="flex gap-2">
        { stepsArray.map((item, index) => (
          <div key={`step-${item}-${index}`} className="flex gap-2 items-center">
            <li className="flex gap-2 items-center">
              <div
                id={`step-number-circle-${index + 1}`}
                className={circleClass(index)}
              >
                { currentStep > index + 1 ? (<CheckSVG />) : (<span className={spanNumberClass(index)}>{index + 1}</span>)}
              </div>
              <h3 className={h3Class(index)}>
                {item}
              </h3>
            </li>
            { (index + 1 !== stepsArray.length) && (
              <div className="block">
                <ArrowRightIcon />
              </div>
            ) }
          </div>
        ))}
      </ul>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-0">
      <ul aria-label="Steps" className="items-center text-gray-600 dark:text-gray-400 font-medium md:flex">
        {stepsArray.map((item, index) => (
          <li key={item} aria-current={currentStep === index + 1 ? "step" : false} className="flex-1 last:flex-none flex md:items-center">
            <div className="flex gap-x-3">
              <div className="flex items-center flex-col gap-x-2">
                <div className={`w-8 h-8 rounded-full border-2 flex-none flex items-center justify-center ${currentStep > index + 1 && "bg-indigo-600 dark:bg-indigo-400 border-indigo-600 dark:border-indigo-500" || currentStep === index + 1 && "border-indigo-600"}`}>
                  <span className={` ${currentStep > index + 1 && "hidden" || currentStep === index + 1 && "text-indigo-600 dark:text-indigo-400"}`}>
                    {index + 1}
                  </span>
                  {
                    currentStep > index + 1 ? (
                      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : ""
                  }
                </div>
                <div className={`h-12 flex items-center md:hidden ${index + 1 === stepsArray.length && "hidden"}`}>
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <div className="h-8 flex items-center md:h-auto">
                <h3 className={`text-sm ${currentStep == index + 1 && "text-indigo-600 dark:text-indigo-400"}`}>
                  {item}
                </h3>
              </div>
            </div>
            <div className={`flex-1 hidden md:block ${index + 1 == stepsArray.length && "md:hidden"}`}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}