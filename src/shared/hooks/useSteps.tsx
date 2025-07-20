import { useState } from "react";

interface UseStepsProps {
  firstStep: number
}


export const useSteps = ({ firstStep }: UseStepsProps) => {
  const [step, setStep] = useState<number>(firstStep);

  const goNext = () => {
    setStep((prev) => prev + 1);
  }
  const goPrev = () => {
    setStep((prev) => (prev > firstStep ? prev - 1 : prev));
  }

  return {
    step,
    goNext,
    goPrev,
  }
}