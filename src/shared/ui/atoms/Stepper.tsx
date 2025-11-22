import clsx from "clsx"

interface StepperProps {
  steps: Set<string>
  currentStep: number
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

export const Stepper = ({ steps, currentStep }: StepperProps) => {
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