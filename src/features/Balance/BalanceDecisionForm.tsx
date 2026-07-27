'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Textarea, TextInput } from 'flowbite-react'
import { useState } from 'react'

import {
  BALANCE_DECISION_APPROVE_ACTION,
  BALANCE_DECISION_CONFIRM_APPROVE,
  BALANCE_DECISION_CONFIRM_REJECT,
  BALANCE_DECISION_CONFLICT_MESSAGE,
  BALANCE_DECISION_DISMISS_ACTION,
  BALANCE_DECISION_ERROR_MESSAGE,
  BALANCE_DECISION_REASON_HELPER,
  BALANCE_DECISION_REASON_LABEL,
  BALANCE_DECISION_REASON_PLACEHOLDER,
  BALANCE_DECISION_REFERENCE_LABEL,
  BALANCE_DECISION_REFERENCE_PLACEHOLDER,
  BALANCE_DECISION_REJECT_ACTION,
  BALANCE_DECISION_SECTION_TITLE
} from '@/shared/constants/balance.constants'
import {
  AdminBalanceRequestDto,
  BalanceDecisionConflictError,
  BalanceDecisionPayload
} from '@/shared/types/balance.types'
import { decideBalanceRequestCb } from '@/shared/utils/balance.utils'

interface BalanceDecisionFormProps {
  requestId: string
  onDecided?: () => void
}

type DecisionMode = 'idle' | 'approve' | 'reject'

export const BalanceDecisionForm = ({ requestId, onDecided }: BalanceDecisionFormProps): JSX.Element => {
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<DecisionMode>('idle')
  const [paymentReference, setPaymentReference] = useState('')
  const [reason, setReason] = useState('')

  const mutation = useMutation<
    AdminBalanceRequestDto,
    AxiosError<BalanceDecisionConflictError>,
    { requestId: string; payload: BalanceDecisionPayload }
  >({
    mutationFn: decideBalanceRequestCb,
    onSuccess: () => {
      setMode('idle')
      setPaymentReference('')
      setReason('')
      queryClient.invalidateQueries({ queryKey: ['balance', 'requests'] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      onDecided?.()
    }
  })

  const selectMode = (nextMode: DecisionMode) => {
    mutation.reset()
    setMode(nextMode)
  }

  const handleCancel = () => {
    mutation.reset()
    setMode('idle')
    setPaymentReference('')
    setReason('')
  }

  const handleConfirmApprove = () => {
    const trimmedReference = paymentReference.trim()
    if (!trimmedReference || mutation.isPending) return

    mutation.mutate({ requestId, payload: { action: 'approve', paymentReference: trimmedReference } })
  }

  const handleConfirmReject = () => {
    if (mutation.isPending) return

    const trimmedReason = reason.trim()
    const payload: BalanceDecisionPayload = trimmedReason
      ? { action: 'reject', reason: trimmedReason }
      : { action: 'reject' }

    mutation.mutate({ requestId, payload })
  }

  const isConflict =
    mutation.isError &&
    mutation.error?.response?.status === 409 &&
    mutation.error?.response?.data?.code === 'BAL-BUS-002'

  const errorMessage = isConflict ? BALANCE_DECISION_CONFLICT_MESSAGE : BALANCE_DECISION_ERROR_MESSAGE

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{BALANCE_DECISION_SECTION_TITLE}</h3>

      <div className="flex justify-between">
        <Button color="red" outline onClick={() => selectMode('reject')} className="hover:cursor-pointer">
          {BALANCE_DECISION_REJECT_ACTION}
        </Button>
        <Button color="green" onClick={() => selectMode('approve')} className="hover:cursor-pointer">
          {BALANCE_DECISION_APPROVE_ACTION}
        </Button>
      </div>

      {mode === 'approve' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="balance-decision-payment-reference">{BALANCE_DECISION_REFERENCE_LABEL}</Label>
            <TextInput
              id="balance-decision-payment-reference"
              placeholder={BALANCE_DECISION_REFERENCE_PLACEHOLDER}
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>

          {mutation.isError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-between gap-3">
            <Button color="red" outline onClick={handleCancel} className="hover:cursor-pointer">
              {BALANCE_DECISION_DISMISS_ACTION}
            </Button>
            <Button
              color="green"
              disabled={!paymentReference.trim() || mutation.isPending}
              onClick={handleConfirmApprove}
              className="hover:cursor-pointer"
            >
              {BALANCE_DECISION_CONFIRM_APPROVE}
            </Button>
          </div>
        </div>
      )}

      {mode === 'reject' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="balance-decision-reason">{BALANCE_DECISION_REASON_LABEL}</Label>
            <Textarea
              id="balance-decision-reason"
              placeholder={BALANCE_DECISION_REASON_PLACEHOLDER}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{BALANCE_DECISION_REASON_HELPER}</p>
          </div>

          {mutation.isError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-between gap-3">
            <Button color="alternative" onClick={handleCancel} className="hover:cursor-pointer">
              {BALANCE_DECISION_DISMISS_ACTION}
            </Button>
            <Button
              color="red"
              disabled={mutation.isPending}
              onClick={handleConfirmReject}
              className="hover:cursor-pointer"
            >
              {BALANCE_DECISION_CONFIRM_REJECT}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
