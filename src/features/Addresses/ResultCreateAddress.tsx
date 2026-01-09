import { RiCheckboxCircleFill, RiCloseCircleFill } from "@remixicon/react";
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
      <h4 className="text-xl font-semibold text-center text-blue-800 dark:text-blue-600">{title}</h4>
      <ul className="flex flex-col gap-3 items-center">
        <li className="inline-flex gap-1">
          <RiCheckboxCircleFill className="text-blue-800 dark:text-blue-600" />
          Dirección creada en el sistema
        </li>
        <li className="inline-flex gap-1">
          { !showErrorCreateAddressGe ? (
            <RiCheckboxCircleFill className="text-blue-800 dark:text-blue-600" />
          ) : (
            <RiCloseCircleFill className="text-red-600 dark:text-red-700" />
          ) }
          Dirección creada en GE
        </li>
      </ul>
      { showErrorCreateAddressGe && (
        <p className="text-gray-600 dark:text-gray-400 text-center">Para volver a intentarlo, ve en el menú &quot;Direcciones&quot; en el apartado de &quot;Direcciones pendientes por crear en GE&quot;.</p>
      )}
      <Button outline onClick={toggleModal}>Listo</Button>
    </section>
  )
}