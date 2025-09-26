import { MnGuide } from "@/shared/types/guides.types";
import { formatNumberToCurrency } from "@/shared/utils/global.utils";
import { RiFileList3Line, RiMoneyDollarCircleLine, RiTruckLine } from "@remixicon/react";

interface ResultGuideScreenProps {
  guide: MnGuide | undefined;
  isSuccess: boolean;
  isError: boolean;
}

export const ResultGuideScreen = ({ guide, isSuccess, isError }: ResultGuideScreenProps) => {
  const title = isSuccess ? "Guía creada con éxito" : "Error al crear la guía"
  const formattedPrice = formatNumberToCurrency((Number(guide?.price ?? 0)))

  return (
    <section className="flex flex-col gap-6">
      <h4 className="text-xl font-bold text-center">{title}</h4>
      { isSuccess && guide && Boolean(guide) && (
        <article className="flex flex-col gap-6">
          <div className="inline-flex gap-2">
            <RiFileList3Line />
            <p>Número de guía: {guide.tracking_number}</p>
          </div>
          <div className="inline-flex gap-2">
            <RiTruckLine />
            <p>{guide?.carrier}</p>
          </div>
          <div className="inline-flex gap-2">
            <RiMoneyDollarCircleLine />
            <p>{formattedPrice}</p>
          </div>
        </article>
      )}
      { isError && !isSuccess && (
        <p className="text-red-600 text-center">Ocurrió un error al crear la guía. Por favor, intente nuevamente.</p>
      )}
    </section>
  )
}