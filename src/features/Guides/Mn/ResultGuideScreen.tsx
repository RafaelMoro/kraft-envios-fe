import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { RiAttachmentLine, RiFileList3Line, RiMoneyDollarCircleLine, RiTruckLine } from "@remixicon/react";

import { GlobalCreateGuideResponse } from "@/shared/types/guides.types";
import { formatNumberToCurrency } from "@/shared/utils/global.utils";
import { b64toBlob } from "@/shared/utils/guides.utils";

interface ResultGuideScreenProps {
  guide: GlobalCreateGuideResponse | undefined;
  errorMessage?: string
  isSuccess: boolean;
  isError: boolean;
  closeModal: () => void
}

export const ResultGuideScreen = ({ guide, isSuccess, isError, errorMessage, closeModal }: ResultGuideScreenProps) => {
  const [urlFile, setUrlFile] = useState<string | null>(null);
  const title = isSuccess ? "Guía creada con éxito" : "Error al crear la guía"
  const formattedPrice = formatNumberToCurrency((Number(guide?.price ?? 0)))

  useEffect(() => {
    if (guide?.source === 'Pkk' && (guide?.file)) {
      const blob = b64toBlob(guide.file, 'application/pdf');
      const url = window.URL.createObjectURL(blob);
      setUrlFile(url);
    }
  }, [guide?.file, guide?.source])

  return (
    <section className="flex flex-col gap-6">
      <h4 className="text-xl font-bold text-center">{title}</h4>
      { isSuccess && guide && Boolean(guide) && (
        <div className="flex flex-col items-center gap-10">
          <article className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="inline-flex gap-2">
              <RiFileList3Line />
              <p>Número de guía: {guide.trackingNumber}</p>
            </div>
            <div className="inline-flex gap-2">
              <RiTruckLine />
              <p>{guide?.carrier}</p>
            </div>
            <div className="inline-flex gap-2">
              <RiMoneyDollarCircleLine />
              <p>{formattedPrice}</p>
            </div>
            <div className="inline-flex gap-2">
              <RiAttachmentLine />
              <a href={guide?.source === 'Pkk' ? (urlFile ?? '') : (guide?.labelUrl ?? '')} target="_blank" rel="noopener noreferrer">Ver etiqueta</a>
            </div>
          </article>
          <Button onClick={closeModal} outline>
            Finalizar
          </Button>
        </div>
      )}
      { isError && !isSuccess && (
        <div className="flex flex-col gap-6">
          <p className="text-red-600 text-center">
            { errorMessage === 'No cuenta con saldo suficiente'
              ? 'Saldo insuficiente en TONE. Por favor, recarga tu cuenta e intenta nuevamente.'
              : 'Ocurrió un error al crear la guía. Por favor, intente nuevamente.'
            }
          </p>
          <Button color="red" onClick={closeModal} outline>
            Finalizar
          </Button>
        </div>
      )}
    </section>
  )
}