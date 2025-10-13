import { PackageType, TYPE_PACKAGE } from "@/shared/types/quotes.types";
import { Dropdown, DropdownItem } from "flowbite-react"

interface TypePackageProps {
  typePackage: PackageType;
  updateTypePackage: (type: PackageType) => void
}

export const TypePackage = ({ typePackage, updateTypePackage }: TypePackageProps) => {
  const options: PackageType[] = [...TYPE_PACKAGE]

  const packageTypeLabels: Record<PackageType, string> = {
    box: 'Caja de cartón',
    envelope: 'Sobre'
  }

  return (
    <div className="md:col-span-2">
      <Dropdown label={`Tipo de paquete: ${packageTypeLabels[typePackage]}`} inline>
        { options.map((type) => (
          <DropdownItem key={type} onClick={() => updateTypePackage(type)}>
            {packageTypeLabels[type]}
          </DropdownItem>
        )) }
      </Dropdown>
    </div>
  )
}