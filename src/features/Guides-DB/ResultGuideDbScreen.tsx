import { Button } from "flowbite-react";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";

import { GuideDbResultData } from "@/shared/types/guides.types";
import {
  GUIDE_DB_GENERIC_ERROR_MESSAGE,
  GUIDE_DB_GENERIC_FAILED_MESSAGE,
  GUIDE_DB_PROVIDER_FAILED_MESSAGE,
  GUIDE_DB_RESULT_ERROR_HEADINGS,
  GUIDE_DB_RESULT_PROVIDER_FAILED_HEADINGS,
  GUIDE_DB_RESULT_SUCCESS_HEADINGS,
} from "@/shared/constants/guides.constants";

interface ResultGuideDbScreenProps {
  result: GuideDbResultData | undefined;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  closeModal: () => void;
  mode?: 'create' | 'edit';
}

const KNOWN_FAILURE_PREFIXES = [
  "GDE-AUTH",
  "GDE-BDN",
  "GDE-PVR",
  "GDE-NET",
  "GDE-TMOT",
  "GDE-RLIM",
  "GDE-BUS",
];

/**
 * Renders Guides DB result semantics. HTTP 201 with `status: 'failed'` is a saved
 * DB record where the provider could not create the guide, not a transport error.
 */
export const ResultGuideDbScreen = ({
  result,
  isSuccess,
  isError,
  errorMessage,
  closeModal,
  mode = 'create',
}: ResultGuideDbScreenProps) => {
  if (isError) {
    return (
      <section className="flex flex-col gap-6">
        <h4 className="text-xl font-bold text-center">{GUIDE_DB_RESULT_ERROR_HEADINGS[mode]}</h4>
        <p className="text-red-600 text-center">
          {errorMessage ?? GUIDE_DB_GENERIC_ERROR_MESSAGE}
        </p>
        <div className="flex justify-center">
          <Button color="red" onClick={closeModal} outline>
            Finalizar
          </Button>
        </div>
      </section>
    )
  }

  if (isSuccess && result?.status === "created") {
    return (
      <section className="flex flex-col gap-6">
        <h4 className="text-xl font-bold text-center">{GUIDE_DB_RESULT_SUCCESS_HEADINGS[mode]}</h4>
        <div className="flex flex-col items-center gap-4">
          <RiCheckboxCircleLine size={48} className="text-green-600" />
          <p className="text-center">
            La guía <span className="font-bold">#{result.kraftId}</span> se guardó en Kraft y el
            proveedor <span className="font-bold">{result.provider}</span> la creó correctamente.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={closeModal} outline>
            Finalizar
          </Button>
        </div>
      </section>
    )
  }

  if (isSuccess && result?.status === "failed") {
    const errorCode = result.failureInfo?.errorCode ?? "";
    const isKnownCode = KNOWN_FAILURE_PREFIXES.some((prefix) =>
      errorCode.startsWith(prefix),
    );
    const message = isKnownCode
      ? GUIDE_DB_PROVIDER_FAILED_MESSAGE
      : GUIDE_DB_GENERIC_FAILED_MESSAGE;

    return (
      <section className="flex flex-col gap-6">
        <h4 className="text-xl font-bold text-center">
          {GUIDE_DB_RESULT_PROVIDER_FAILED_HEADINGS[mode]}
        </h4>
        <div className="flex flex-col items-center gap-4">
          <RiErrorWarningLine size={48} className="text-yellow-500" />
          <p className="text-center">
            {message}
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={closeModal} outline>
            Finalizar
          </Button>
        </div>
      </section>
    )
  }

  return null
}
