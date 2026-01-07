import { RiCheckboxCircleFill } from "@remixicon/react";
import { Button } from "flowbite-react";

interface ResultCreateAddressProps {
  toggleModal: () => void;
  showErrorCreateAddressGe?: boolean;
}

export const ResultCreateAddress = ({ toggleModal, showErrorCreateAddressGe }: ResultCreateAddressProps) => {
  const title = showErrorCreateAddressGe
    ? '¡Ups! Ocurrió un problema al añadir la dirección.'
    : '¡Perfecto! Dirección añadida correctamente.'

  return (
    <section className="flex flex-col gap-10">
      <h4 className="text-xl font-semibold text-center text-blue-800 dark:text-blue-900">{title}</h4>
      <ul className="flex flex-col gap-3 items-center">
        <li className="inline-flex gap-1">
          <RiCheckboxCircleFill className="text-blue-800 dark:text-blue-900" />
          Dirección creada en el sistema
        </li>
        <li className="inline-flex gap-1">
          <RiCheckboxCircleFill className="text-blue-800 dark:text-blue-900" />
          Dirección creada en GE
        </li>
      </ul>
      <Button outline onClick={toggleModal}>Listo</Button>
    </section>
  )
}