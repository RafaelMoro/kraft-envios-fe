import { GetGuidesData } from "@/shared/types/guides.types"
import { RiAttachmentLine, RiInfoCardLine, RiMapPinLine } from "@remixicon/react"
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react"

interface GuidesTableProps {
  guides: GetGuidesData[]
  isPending: boolean;
}

export const GuidesTable = ({ guides, isPending }: GuidesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table striped hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell className="min-w-52 text-base">Remitente</TableHeadCell>
            <TableHeadCell className="min-w-52 text-base">Destinatario</TableHeadCell>
            <TableHeadCell className="min-w-40 text-base">Proveedor</TableHeadCell>
            <TableHeadCell className="text-base px-2">Origen</TableHeadCell>
            <TableHeadCell className="text-base">Número de guia</TableHeadCell>
            <TableHeadCell className="text-base">Número de envio</TableHeadCell>
            <TableHeadCell className="text-base px-2">Estado</TableHeadCell>
            <TableHeadCell className="text-base px-2">Etiqueta</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          { isPending && Array.from({ length: 5 }).map((_, index) => (
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={index}>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
              <TableCell>
                <div className="bg-slate-400 rounded animate-pulse h-8 w-full" />
              </TableCell>
            </TableRow>
          ))}
          { !isPending && guides.map((guide) => (
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={guide.trackingNumber}>
              <TableCell>
                <div className="flex flex-col gap-3 text-gray-950">
                  <div className="inline-flex gap-2">
                    <RiInfoCardLine size={18} /> 
                    <p>{guide?.origin?.alias}</p>
                  </div>
                  <div className="inline-flex gap-2">
                    <RiMapPinLine size={25} />
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
                    <RiMapPinLine size={20} />
                    <p>{guide?.destination?.street} {guide?.destination?.streetNumber}, {guide?.destination?.neighborhood}, {guide?.destination?.city}, {guide?.destination?.state}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-950">
                {guide.carrier}
              </TableCell>
              <TableCell>{guide.source}</TableCell>
              <TableCell className="text-gray-950">{guide.trackingNumber}</TableCell>
              <TableCell>{guide?.shipmentNumber}</TableCell>
              <TableCell className="px-2 text-gray-950">{guide.status}</TableCell>
              <TableCell className="px-2">
                <a href={guide?.labelUrl ?? ''} target="_blank" rel="noopener noreferrer">
                  <RiAttachmentLine />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}