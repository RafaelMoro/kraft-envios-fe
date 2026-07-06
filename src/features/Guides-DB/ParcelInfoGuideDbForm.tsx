"use client"
import { Button, Checkbox, Label, TextInput } from "flowbite-react"
import { ReactNode, useState } from "react"

import {
  CreateGuideDbFormValues,
  PackageDimensions,
  SearchProduct,
} from "@/shared/types/guides.types"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage"

interface ParcelInfoGuideDbFormProps {
  children: ReactNode
  parcelInfo: CreateGuideDbFormValues['parcelInfo']
  packageDimensions: PackageDimensions | null
  isMobileTablet: boolean
  searchProductSat: string
  selectedProduct: SearchProduct | null
  goNext: () => void
  goPrev: () => void
  updateParcelInfo: (data: CreateGuideDbFormValues['parcelInfo']) => void
  updateErrorProductSat: (message: string) => void
}

export const ParcelInfoGuideDbForm = ({
  children,
  parcelInfo,
  packageDimensions,
  isMobileTablet,
  searchProductSat,
  selectedProduct,
  goNext,
  goPrev,
  updateParcelInfo,
  updateErrorProductSat,
}: ParcelInfoGuideDbFormProps) => {
  const [content, setContent] = useState<string>(parcelInfo.content)
  const [value, setValue] = useState<string>(parcelInfo.value)
  const [quantity, setQuantity] = useState<string>(parcelInfo.quantity)
  const [contentError, setContentError] = useState<string>('')
  const [notifyMe, setNotifyMe] = useState<boolean>(parcelInfo.notifyMe)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!searchProductSat) {
      updateErrorProductSat('Debes de buscar un producto para categorizarlo')
      return
    }
    if (!selectedProduct) {
      updateErrorProductSat('Debes de seleccionar un producto válido de la lista')
      return
    }
    if (!content.trim() || content.trim().length < 2) {
      setContentError('Contenido es requerido')
      return
    }
    if (!packageDimensions) {
      updateErrorProductSat('No hay dimensiones del paquete disponibles. Vuelve a cotizar.')
      return
    }
    setContentError('')
    updateParcelInfo({
      content: content.trim(),
      value,
      quantity,
      notifyMe,
    })
    goNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      {isMobileTablet && (
        <h5 className="text-xl font-bold text-center mb-5">Información del paquete</h5>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Las dimensiones del paquete vienen de tu cotización. Para cambiarlas, vuelve a cotizar.
      </p>
      <section className="flex flex-col gap-4">
        {children}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="db-length">Largo (cm)</Label>
            </div>
            <TextInput
              id="db-length"
              data-testid="db-length"
              type="text"
              value={packageDimensions?.length ?? ''}
              disabled
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="db-width">Ancho (cm)</Label>
            </div>
            <TextInput
              id="db-width"
              data-testid="db-width"
              type="text"
              value={packageDimensions?.width ?? ''}
              disabled
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="db-height">Alto (cm)</Label>
            </div>
            <TextInput
              id="db-height"
              data-testid="db-height"
              type="text"
              value={packageDimensions?.height ?? ''}
              disabled
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="db-weight">Peso (kg)</Label>
            </div>
            <TextInput
              id="db-weight"
              data-testid="db-weight"
              type="text"
              value={packageDimensions?.weight ?? ''}
              disabled
            />
          </div>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="db-content">Contenido del paquete</Label>
          </div>
          <TextInput
            id="db-content"
            data-testid="db-content"
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {contentError && <ErrorMessage>{contentError}</ErrorMessage>}
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="db-value">Valor del paquete (opcional)</Label>
          </div>
          <TextInput
            id="db-value"
            data-testid="db-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="db-quantity">Cantidad (opcional)</Label>
          </div>
          <TextInput
            id="db-quantity"
            data-testid="db-quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="db-notify-me"
            data-testid="db-notify-me"
            checked={notifyMe}
            onChange={(e) => setNotifyMe(e.target.checked)}
          />
          <Label htmlFor="db-notify-me">Notificarme sobre el envío</Label>
        </div>
      </section>
      <div className="flex justify-between mt-4">
        <Button
          color="light"
          data-testid="db-parcel-prev-button"
          className="hover:cursor-pointer"
          onClick={goPrev}
        >
          Regresar
        </Button>
        <Button data-testid="db-parcel-next-button" type="submit" className="hover:cursor-pointer">
          Siguiente
        </Button>
      </div>
    </form>
  )
}
