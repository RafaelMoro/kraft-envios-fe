import { useQuery } from "@tanstack/react-query"

import { LoginData } from "@/shared/types/login.types"
import { getGuidesCb } from "@/shared/utils/guides.utils"
import { GuidesTable } from "@/features/Guides/ViewGuides/GuidesTable"
import { GetGuidesData } from "@/shared/types/guides.types"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import { GuideCard } from "@/features/Guides/ViewGuides/GuideCard"

interface OrderProps {
  userInfo: LoginData | null
}

export const Order = ({ userInfo }: OrderProps) => {
  const { isMobileTablet } = useMediaQuery()
  // const { data, isPending, isError } = useQuery({
  //   queryKey: ['guides'],
  //   queryFn: getGuidesCb
  // })
  const mockData: GetGuidesData[] = [
    {
      "trackingNumber": "2033721830",
      "shipmentNumber": "fec6fcd2-b671-4f37-a1fb-02c081297e19",
      "source": "GE",
      "status": "generada",
      "carrier": "DHL Economy Select 🟨BYTE",
      "price": 156.13,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/ec9e2080-ef61-468f-be5c-1f81d59c0fcc/fec6fcd2-b671-4f37-a1fb-02c081297e19-dhl-economy-select-byte.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Maria de Jesus Bautista",
        "alias": "Maria de Jesus Bautista",
        "street": "Primavera",
        "streetNumber": "157",
        "neighborhood": "Paseo Residencial",
        "city": "Reynosa",
        "state": "Tamaulipas"
      }
    },
    {
      "trackingNumber": "2504241611",
      "shipmentNumber": "ec08ec00-09a7-4909-b71e-727936551a81",
      "source": "GE",
      "status": "generada",
      "carrier": "DHL Economy Select 🟨BYTE",
      "price": 499.06,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/f9619e1e-ff44-4dc1-a73a-21a614929ccb/ec08ec00-09a7-4909-b71e-727936551a81-dhl-economy-select-byte.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Jose M Olguin T",
        "alias": "Jose M Olguin T",
        "street": "Cerro Cocotitlan Lte 16",
        "streetNumber": "0",
        "neighborhood": "Los Heroes Chalco",
        "city": "Mexico",
        "state": "Mexico"
      }
    },
    {
      "trackingNumber": "3255910502612700003805",
      "shipmentNumber": "86f699d0-96ee-4611-a775-e152fb6583c4",
      "source": "GE",
      "status": "generada",
      "carrier": "Estafeta Terrestre Económico (CODECO)",
      "price": 261,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/386a0f0a-2bb4-4282-a436-1c6be6c49b30/86f699d0-96ee-4611-a775-e152fb6583c4-estafeta-terrestre-economico-codeco.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Yaremi Sarai Andrade",
        "alias": "Yaremi Sarai Andrade",
        "street": "Mexico Nte",
        "streetNumber": "9",
        "neighborhood": "Acaponeta Centro",
        "city": "Acaponeta",
        "state": "Nayarit"
      }
    },
    {
      "trackingNumber": "5550786312",
      "shipmentNumber": "3f9e0d26-db99-4ee6-8f61-7bdf05beee14",
      "source": "GE",
      "status": "generada",
      "carrier": "DHL Domestic (Zona 6)🟨",
      "price": 473.87,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/43dd1f21-ff61-4a7f-bf20-ae3d556c75f3/3f9e0d26-db99-4ee6-8f61-7bdf05beee14-dhl-domestic-zona-6.pdf",
      "file": null,
      "origin": {
        "name": "Armando Mendez",
        "alias": "Armando Mendez",
        "street": "Av Aviacion",
        "streetNumber": "3906",
        "neighborhood": "Altamira",
        "city": "Zapopan",
        "state": "Jalisco"
      },
      "destination": {
        "name": "Rafael Fco Arias Benitez",
        "alias": "Rafael Fco Arias",
        "street": "Adolfo Ruiz Cortines",
        "streetNumber": "3510",
        "neighborhood": "Costa de Oro",
        "city": "Boca del Río",
        "state": "Veracruz de Ignacio de la Llave"
      }
    },
    {
      "trackingNumber": "3505910842630700104171",
      "shipmentNumber": "f6cb2337-d35a-418f-8309-fe5879599bef",
      "source": "GE",
      "status": "generada",
      "carrier": "Estafeta 1-25 kgs con recoleccion $220",
      "price": 185,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/de778308-a8af-41b7-8572-502243213952/f6cb2337-d35a-418f-8309-fe5879599bef-estafeta-1-25-kgs-con-recoleccion-220.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Erika Rivera Hdz",
        "alias": "Erika Rivera Hdz",
        "street": "Calle 14 Av 37",
        "streetNumber": "0",
        "neighborhood": "Luis Donaldo Colosio",
        "city": "Agua Prieta",
        "state": "Sonora"
      }
    },
    {
      "trackingNumber": "3055910765630700065221",
      "shipmentNumber": "4e8e53f1-ed4a-414d-98d6-03a6f4e27e6d",
      "source": "GE",
      "status": "generada",
      "carrier": "Estafeta Terrestre Económico (CODECO)",
      "price": 245,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/fe689838-ad13-45b7-98bc-918ff4163764/4e8e53f1-ed4a-414d-98d6-03a6f4e27e6d-estafeta-terrestre-economico-codeco.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez Gomez",
        "alias": "Uriel Gonzalez Gomez",
        "street": "Shuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Ana Rebeca Juarez M",
        "alias": "Ana Rebeca Juarez M",
        "street": "Pirules Mz 13 Lt 18",
        "streetNumber": "0",
        "neighborhood": "Morelos",
        "city": "Baja California sur",
        "state": "Baja California"
      }
    },
    {
      "trackingNumber": "0505910842630700093189",
      "shipmentNumber": "4c76eb75-0817-44b7-9b32-c9da6a2aae54",
      "source": "GE",
      "status": "generada",
      "carrier": "Estafeta 1-25 kgs con recoleccion $220",
      "price": 185,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/3efd219e-0984-4da0-ae31-e3b535f533f4/4c76eb75-0817-44b7-9b32-c9da6a2aae54-estafeta-1-25-kgs-con-recoleccion-220.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Maria de Jesus Bautista",
        "alias": "Maria de Jesus Bautista",
        "street": "Primavera",
        "streetNumber": "157",
        "neighborhood": "Paseo Residencial",
        "city": "Reynosa",
        "state": "Tamaulipas"
      }
    },
    {
      "trackingNumber": "6055910765630700055438",
      "shipmentNumber": "7c699a24-28fd-41c8-9e41-d906cee58703",
      "source": "GE",
      "status": "generada",
      "carrier": "Estafeta Terrestre Económico (CODECO)",
      "price": 329,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/e3dcf693-91b8-4b41-b977-a6f778a0558e/7c699a24-28fd-41c8-9e41-d906cee58703-estafeta-terrestre-economico-codeco.pdf",
      "file": null,
      "origin": {
        "name": "Jose M Olguin T",
        "alias": "Jose M Olguin T",
        "street": "Cerro Cocotitlan Lte 16",
        "streetNumber": "0",
        "neighborhood": "Los Heroes Chalco",
        "city": "Mexico",
        "state": "Mexico"
      },
      "destination": {
        "name": "Mariana Zamores",
        "alias": "Mariana Zamores",
        "street": "Huitlacocha",
        "streetNumber": "382",
        "neighborhood": "La Huitlacocha",
        "city": "Lagos de Moreno",
        "state": "Jalisco"
      }
    },
    {
      "trackingNumber": "8142294366",
      "shipmentNumber": "5b78cc67-f2c7-4936-ac14-a249dce3e8a1",
      "source": "GE",
      "status": "generada",
      "carrier": "DHL Express (Zona 4)🟨",
      "price": 265.77,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/15eeeb51-0e3b-43e5-a867-9ece2735697c/5b78cc67-f2c7-4936-ac14-a249dce3e8a1-dhl-express-zona-4.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Adriana Elizabeth Perez",
        "alias": "Adriana Elizabeth Perez",
        "street": "Rio Pesqueria",
        "streetNumber": "18",
        "neighborhood": "Fuentes Secc Lomas",
        "city": "Reynosa",
        "state": "Tamaulipas"
      }
    },
    {
      "trackingNumber": "3505910842630700068121",
      "shipmentNumber": "6c38a964-2deb-44d6-ab2c-ab51fd335f55",
      "source": "GE",
      "status": "generada",
      "carrier": "Estafeta 1-25 kgs con recoleccion $220",
      "price": 229,
      "guideLink": null,
      "labelUrl": "https://6dfb173c-ee1e-4b44-a0b8-cfe67c3bef34.s3.us-west-2.amazonaws.com/uploads/label/file/3093b66e-a614-467d-81bb-99375e5076c8/6c38a964-2deb-44d6-ab2c-ab51fd335f55-estafeta-1-25-kgs-con-recoleccion-220.pdf",
      "file": null,
      "origin": {
        "name": "Uriel Gonzalez",
        "alias": "Uriel Gonzalez",
        "street": "Schuman",
        "streetNumber": "3",
        "neighborhood": "Vallejo",
        "city": "Gustavo A Madero",
        "state": "Ciudad de Mexico"
      },
      "destination": {
        "name": "Maria del Carmen Alvarez",
        "alias": "Maria del Carmen Alvarez",
        "street": "Paso de Tablas Loc 3",
        "streetNumber": "0",
        "neighborhood": "Centro",
        "city": "Tequisquiapan",
        "state": "Queretaro"
      }
    }
  ]

  return (
    <main className='w-full p-4 flex flex-col gap-5'>
      <h1 className="text-3xl font-bold text-center">Bienvenido {userInfo?.data?.user?.name}</h1>
      { isMobileTablet && (
        <div className="grid md:grid-cols-2 gap-5">
          { mockData.map((guide => (
            <GuideCard key={guide.trackingNumber} guide={guide} />
          )))}
        </div>
      ) }
      <GuidesTable guides={mockData ?? []} />
    </main>
  )
}