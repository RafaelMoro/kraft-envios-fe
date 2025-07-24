import { LOGIN_ROUTE } from "@/shared/constants/global.constants";
import { SUCCESS_CREATE_USER_MESSAGE, SUCCESS_CREATE_USER_SPAN, SUCCESS_CREATE_USER_TITLE } from "@/shared/constants/login.constants";
import { LinkButton } from "@/shared/ui/atoms/LinkButton";
import { Button, Card } from "flowbite-react";

interface ResultCardProps {
  title: string;
  message: string;
  isError: boolean;
  resetStep: () => void;
}

export const ResultCard = ({
  title, message, isError, resetStep
}: ResultCardProps) => {
  if (isError) {
    return (
      <Card className="max-w-[400px]">
        <h5 className="text-2xl font-bold text-center text-gray-900 dark:text-white text-balance">
          {title}
        </h5>
        <p className="text-xl text-black dark:text-white text-pretty">{message}</p>
        <div className="flex justify-between">
          <LinkButton href={LOGIN_ROUTE} type="secondary" >
            Regresar al inicio
          </LinkButton>
          <Button onClick={resetStep} className="hover:cursor-pointer">
            Volver a intentar.
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="max-w-[400px]">
      <h5 className="text-2xl font-bold text-center text-gray-900 dark:text-white text-balance">
        {SUCCESS_CREATE_USER_TITLE}
        <span className="block">{SUCCESS_CREATE_USER_SPAN}</span>
      </h5>
      <p className="text-xl text-black dark:text-white">
        {SUCCESS_CREATE_USER_MESSAGE}
      </p>
        <div className="w-full flex justify-center">
          <LinkButton href={LOGIN_ROUTE} >
            Regresar al inicio
          </LinkButton>
        </div>
    </Card>
  )
}