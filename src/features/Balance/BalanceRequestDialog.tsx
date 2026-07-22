'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Modal, ModalBody, ModalHeader, Spinner, TextInput } from 'flowbite-react'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import {
  BalanceRequestDto,
  BalanceRequestFormValues,
  CreateBalanceRequestErrorResponse,
  CreateBalanceRequestPayload,
  balanceRequestSchema
} from '@/shared/types/balance.types'
import { createBalanceRequestCb, formatBalanceMxn } from '@/shared/utils/balance.utils'

const getBalanceRequestErrorMessage = (
  error: AxiosError<CreateBalanceRequestErrorResponse> | null
): string => {
  const response = error?.response?.data

  if (Array.isArray(response?.error?.message)) return response.error.message.join('. ')
  if (response?.error && 'message' in response.error) return response.error.message
  if (response?.message) return response.message

  return 'No pudimos crear la solicitud de saldo. Intenta de nuevo.'
}

export const BalanceRequestDialog = (): JSX.Element => {
  const [openModal, setOpenModal] = useState(false)
  const [submittedAmount, setSubmittedAmount] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BalanceRequestFormValues>({
    defaultValues: { amount: '' },
    resolver: yupResolver(balanceRequestSchema)
  })

  const mutation = useMutation<
    BalanceRequestDto,
    AxiosError<CreateBalanceRequestErrorResponse>,
    CreateBalanceRequestPayload
  >({
    mutationFn: createBalanceRequestCb,
    onSuccess: (_request, payload) => {
      setSubmittedAmount(payload.amount)
      queryClient.invalidateQueries({ queryKey: ['balance', 'requests'] })
    }
  })

  const closeModal = () => setOpenModal(false)
  const openRequestModal = () => setOpenModal(true)

  const submitRequest: SubmitHandler<BalanceRequestFormValues> = (values) => {
    if (mutation.isPending) return

    mutation.mutate({ amount: Number(values.amount) })
  }

  const amountErrorId = errors.amount ? 'balance-request-amount-error' : undefined
  const serverError = mutation.isError ? getBalanceRequestErrorMessage(mutation.error) : null

  return (
    <>
      <Button className="mt-3 w-full hover:cursor-pointer" onClick={openRequestModal} size="sm">
        Solicitar saldo
      </Button>

      <Modal show={openModal} onClose={closeModal} size="md">
        <ModalHeader>Solicitar saldo</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(submitRequest)} className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="balance-request-amount">Monto a solicitar (MXN)</Label>
              </div>
              <TextInput
                id="balance-request-amount"
                type="text"
                inputMode="decimal"
                placeholder="Ej. 500.00"
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={amountErrorId}
                {...register('amount')}
              />
              {errors.amount?.message && (
                <p id="balance-request-amount-error" className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {mutation.isPending && (
              <p role="status" aria-live="polite" className="text-sm text-gray-600 dark:text-gray-300">
                Enviando solicitud...
              </p>
            )}

            {serverError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {serverError}
              </p>
            )}

            {mutation.isSuccess && submittedAmount !== null && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-lg bg-primary-50 p-3 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              >
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">Solicitud recibida</h3>
                <p>
                  Recibimos tu solicitud para agregar{' '}
                  <span className="font-bold">{formatBalanceMxn(submittedAmount)} MXN</span> a tu saldo.
                  Después de que realices el pago, verificaremos que se refleje en nuestra cuenta bancaria.
                  Cuando lo confirmemos, un administrador aprobará la solicitud y actualizaremos tu saldo.
                  Puedes consultar el estado en <span className="font-bold">Solicitudes de saldo</span>.
                </p>
              </div>
            )}

            <Button disabled={mutation.isPending} type="submit" className="w-full hover:cursor-pointer">
              {mutation.isPending ? <Spinner aria-label="Enviando solicitud de saldo" size="sm" /> : 'Enviar solicitud'}
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </>
  )
}
