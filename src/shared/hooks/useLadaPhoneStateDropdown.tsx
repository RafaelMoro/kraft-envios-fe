"use client"

import { useState } from "react";
import { LadaStates } from "../types/global.types";

/**
 * This hook is meant to be used in a parent component to manage the state selected and the errors
 */
export const useLadaPhoneStateDropdown = () => {
  const [ladaState, setLadaState] = useState<LadaStates>({ state: '', lada: [] });
  const [errorLadaState, setErrorLadaState] = useState<string>('');

  const validateLadaStateEmpty = (): boolean => {
    if (!ladaState.state || ladaState.lada.length !== 1) {
      setErrorLadaState('Seleccione un estado válido');
      return false;
    }
    return true
  }

  return {
    ladaState,
    setLadaState,
    errorLadaState,
    setErrorLadaState,
    validateLadaStateEmpty
  }
}