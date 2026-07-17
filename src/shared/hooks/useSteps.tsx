import { useCallback, useState } from "react";

interface UseStepsProps {
  firstStep: number
}


export const useSteps = ({ firstStep }: UseStepsProps) => {
  const [step, setStep] = useState<number>(firstStep);

  const goNext = useCallback(() => {
    setStep((prev) => prev + 1);
  }, [])
  const goPrev = useCallback(() => {
    setStep((prev) => (prev > firstStep ? prev - 1 : prev));
  }, [firstStep])
  const resetSteps = useCallback(() => setStep(firstStep), [firstStep])

  return {
    step,
    goNext,
    goPrev,
    resetSteps
  }
}
