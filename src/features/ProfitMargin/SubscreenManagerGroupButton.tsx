"use client"
import clsx from "clsx"
import { Button, ButtonGroup } from "flowbite-react"

import { MarginProfitSubscreens } from "@/shared/types/margin-profit.types"

interface SubscreenManagerGroupButtonProps {
  subscreen: MarginProfitSubscreens
  updateSubscreen: (newSubscreen: MarginProfitSubscreens) => void
}

export const SubscreenManagerGroupButton = ({ subscreen, updateSubscreen }: SubscreenManagerGroupButtonProps) => {
  const viewProvidersCss = clsx({ "text-indigo-600 dark:text-indigo-400": subscreen === 'view' })
  const editProvidersCss = clsx({ "text-indigo-600 dark:text-indigo-400": subscreen === 'edit' })

  return (
    <div className="w-full flex justify-center">
      <ButtonGroup>
        <Button
          className={viewProvidersCss}
          onClick={() => updateSubscreen('view')}
          color="alternative"
        >
          Ver proveedores
        </Button>
        <Button className={editProvidersCss} onClick={() => updateSubscreen('edit')} color="alternative">
          Editar margen de ganancia
        </Button>
      </ButtonGroup>
    </div>
  )
}