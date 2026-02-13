import { GetGuidesData } from "@/shared/types/guides.types"
import { RiInfoCardLine, RiMapPinLine } from "@remixicon/react"
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react"

interface GuidesTableProps {
  guides: GetGuidesData[]
}

export const GuidesTable = ({ guides }: GuidesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table striped>
        <TableHead>
          <TableRow>
            <TableHeadCell className="min-w-52">Remitente</TableHeadCell>
            <TableHeadCell className="min-w-52">Destinatario</TableHeadCell>
            <TableHeadCell className="min-w-40">Proveedor</TableHeadCell>
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
              <TableCell>
                <div className="flex flex-col gap-3">
                  <div className="inline-flex gap-2">
                    <RiInfoCardLine size={18} /> 
                    <p>{guide?.origin?.alias}</p>
                  </div>
                  <div className="inline-flex gap-2">
                    <RiMapPinLine size={38} />
                    <p>{guide?.origin?.street} {guide?.origin?.streetNumber}, {guide?.origin?.neighborhood}, {guide?.origin?.city}, {guide?.origin?.state}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-3">
                  <div className="inline-flex gap-2">
                    <RiInfoCardLine size={18} /> 
                    <p>{guide?.destination?.alias}</p>
                  </div>
                  <div className="inline-flex gap-2">
                    <RiMapPinLine size={38} />
                    <p>{guide?.destination?.street} {guide?.destination?.streetNumber}, {guide?.destination?.neighborhood}, {guide?.destination?.city}, {guide?.destination?.state}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
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