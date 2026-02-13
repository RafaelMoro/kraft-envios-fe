import { GetGuidesData } from "@/shared/types/guides.types"
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react"

interface GuidesTableProps {
  guides: GetGuidesData[]
}

export const GuidesTable = ({ guides }: GuidesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>Proveedor</TableHeadCell>
            <TableHeadCell>Origen</TableHeadCell>
            <TableHeadCell>Número de guia</TableHeadCell>
            <TableHeadCell>Número de envio</TableHeadCell>
            <TableHeadCell>Estado</TableHeadCell>
            <TableHeadCell>Etiqueta</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          { guides.map((guide) => (
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={guide.trackingNumber}>
              <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {guide.carrier}
              </TableCell>
              <TableCell>{guide.source}</TableCell>
              <TableCell>{guide.trackingNumber}</TableCell>
              <TableCell>{guide?.shipmentNumber}</TableCell>
              <TableCell>{guide.status}</TableCell>
              <TableCell>{guide.labelUrl}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}