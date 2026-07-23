import { object, ObjectSchema, string, number } from "yup";
import { emailOptionalValidation } from "./login.types";
import { ProviderSource, QuoteCourier, QuoteImage, QuoteTypeService } from "./quotes.types";
import { Address } from "./addresses.types";
import { zipcodeValidation } from "./global.types";

export type GetProductSatIdPayload = {
  search: string;
};

export type AddressType = "destination" | "origin";

export type AliasSaved = {
  alias: string;
  town: string;
  city: string;
  address: Address;
};

export type AliasSavedTone = AliasSaved & {
  addressTone: CreateGuideAddressDataToneFormValues;
};

export type AliasSavedMn = AliasSaved & {
  addressMn: CreateGuideAddressDataMnFormValues;
};

export type AliasesSavedPkk = AliasSaved & {
  addressPkk: CreateGuideAddressDataPkkFormValues;
};

export type AllAliasesSavedTone = {
  origin: AliasSavedTone;
  destination: AliasSavedTone;
};

export type AllAliasSavedMn = {
  origin: AliasSavedMn;
  destination: AliasSavedMn;
};

export type AllAliasSavedPkk = {
  origin: AliasesSavedPkk;
  destination: AliasesSavedPkk;
};

export type CreateGuideFormValuesMn = {
  originAddress: CreateGuideAddressFormValuesMn;
  destinationAddress: CreateGuideAddressFormValuesMn;
  parcelInfo: ParcelInfoFormValues;
};

export type CreateGuideFormValuesTone = {
  originAddress: CreateGuideAddressFormValuesTone;
  destinationAddress: CreateGuideAddressFormValuesTone;
  parcelInfo: ParcelInfoValuesTone;
};

export type CreateGuideFormValuesPkk = {
  originAddress: CreateGuideAddressValuesPkk;
  destinationAddress: CreateGuideAddressValuesPkk;
  parcelInfo: ParcelInfoValuesPkk;
};

/**
 * This type is to show additional info in the confirm modal
 */
export type AddressExtraInfoGE = {
  addressName: string;
  externalNumber: string;
  internalNumber: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
};

export type AddressInfoFormGE = {
  address: CreateGuideAddressValuesGE;
  information: AddressExtraInfoGE;
};

export type CreateGuideFormValuesGE = {
  originAddress: AddressInfoFormGE;
  destinationAddress: AddressInfoFormGE;
  parcelInfo: ParcelInfoValuesGE;
};

/**
 * Type for form values to create a guide for personal data in Mn
 * Adding lastName to homologate the ask for the name field. It's merged into name later in confirm guide
 */
export type PersonalDataFormValues = {
  name: string;
  lastName: string;
  phone: string;
  company?: string | null | undefined;
  email?: string | null | undefined;
};
/**
 * Type for payload to create a guide for personal data in Mn
 */
export type CreateGuidePersonalDataMnPayload = Omit<
  PersonalDataFormValues,
  "lastName"
>;
export type CreateGuidePersonalDataPkkPayload = Omit<
  PersonalDataFormValues,
  "lastName" | "company"
>;
export type CreateGuidePersonalDataTonePayload = Omit<
  PersonalDataFormValues,
  "lastName" | "company"
>;

export type CreateGuideAddressDataMnFormValues = {
  alias?: string;
  street1: string;
  neighborhood: string;
  external_number: string;
  city: string;
  state: string;
  reference?: string | null | undefined;
  town?: string;
  zipcode?: string;
};

export type CreateGuideAddressFormValuesMn = PersonalDataFormValues &
  CreateGuideAddressDataMnFormValues;
/**
 * Type for payload to create a guide address in Mn
 */
export type CreateGuideAddressPayloadMn = CreateGuidePersonalDataMnPayload &
  CreateGuideAddressDataMnFormValues;

export type CreateGuideAddressDataToneFormValues = {
  street1: string;
  neighborhood: string;
  town: string;
  external_number: string;
  state: string;
  reference?: string | null | undefined;
};

export type CreateGuideAddressFormValuesTone = PersonalDataFormValues &
  CreateGuideAddressDataToneFormValues;
/**
 * Type for payload to create a guide address in Tone
 */
export type CreateGuideAddressPayloadTone = CreateGuidePersonalDataTonePayload &
  CreateGuideAddressDataToneFormValues;

export type CreateGuideAddressDataPkkFormValues = {
  street1: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
};

export type CreateGuideAddressFormValuesPkk = PersonalDataFormValues &
  CreateGuideAddressDataPkkFormValues;
/**
 * Type for payload to create a guide address in Pkk
 */
export type CreateGuideAddressPayloadPkk = CreateGuidePersonalDataPkkPayload &
  CreateGuideAddressDataPkkFormValues & {
    isResidential: boolean;
  };

export type PersonalDataGEFormValues = {
  name: string;
  phone: string;
  email?: string | null | undefined;
  company?: string | null | undefined;
  rfc?: string | null | undefined;
};

export type AddressDataGEFormValues = {
  street1: string;
  external_number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  reference?: string | null | undefined;
  alias: string;
};

export type CreateAddressFormValuesGE = PersonalDataGEFormValues &
  AddressDataGEFormValues;

/**
 * This type we're adding `isResidential` as we do not need to add that prop into the schema validation
 */
export type CreateGuideAddressValuesPkk = CreateGuideAddressFormValuesPkk & {
  isResidential: boolean;
};

export type CreateGuideAddressValuesGE = {
  alias: string;
};

export type ParcelInfoFormValues = {
  content: string;
  value: number;
  quantity: number;
};

/**
 * This type represents the parcel information for the form without the checkbox
 */
export type ParcelInfoValues = {
  content: string;
};

/**
 * This type represents the parcel information needed for the mutation
 */
export type ParcelInfoValuesTone = ParcelInfoValues & {
  notifyMe: boolean;
};

export type PackageDimensions = {
  length: string;
  width: string;
  height: string;
  weight: string;
};

export type ParcelInfoValuesPkk = ParcelInfoValues & PackageDimensions;

export type ParcelInfoValuesGE = ParcelInfoValues &
  PackageDimensions & {
    satProductId: string;
  };

export type CreateGuideMnPayload = {
  quoteId: string;
  origin: CreateGuideAddressPayloadMn & { country: string };
  destination: CreateGuideAddressPayloadMn & { country: string };
  parcel: ParcelInfoFormValues & { satProductId: string };
};

export type CreateGuideTonePayload = {
  quoteToken: string;
  notifyMe: boolean;
  origin: CreateGuideAddressPayloadTone;
  destination: CreateGuideAddressPayloadTone;
  parcel: {
    content: string;
  };
};

export type CreateGuidePkkPayload = {
  origin: CreateGuideAddressPayloadPkk;
  destination: CreateGuideAddressPayloadPkk;
  parcel: ParcelInfoValuesPkk;
};

export type CreateGuideGEPayload = {
  quoteId: string;
  origin: CreateGuideAddressValuesGE;
  destination: CreateGuideAddressValuesGE;
  parcel: ParcelInfoValuesGE;
};

export type CreateGuideDbAddressPayload = {
  alias: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  street1: string;
  external_number: string;
  neighborhood: string;
  city: string;
  town: string;
  state: string;
  zipcode: string;
  country: string;
  reference: string;
};

export type CreateGuideDbParcelPayload = {
  length: number;
  width: number;
  height: number;
  weight: number;
  content: string;
  satProductId: string;
  value?: number;
  quantity?: number;
};

export type CreateGuideDbPayload = {
  provider: ProviderSource;
  quote: CreateGuideDbQuotePayload;
  origin: CreateGuideDbAddressPayload;
  destination: CreateGuideDbAddressPayload;
  parcel: CreateGuideDbParcelPayload;
  notifyMe: boolean;
};

/**
 * Send every field for each changed object, omit unchanged objects, and never
 * include quote or notifyMe.
 */
export type UpdateGuideDbPayload = {
  parcel?: CreateGuideDbParcelPayload;
  origin?: CreateGuideDbAddressPayload;
  destination?: CreateGuideDbAddressPayload;
};

export type CreateGuideDbQuotePayload = {
  id: string;
  service: string;
  total: number;
  typeService: QuoteTypeService | null;
  courier: QuoteCourier | null;
  qBaseRef?: number;
  qAdjFactor?: number;
  qAdjBasis?: number;
  qAdjMode?: string;
  qAdjSrcRef?: QuoteAdjustmentSourceReference;
};

export type CreateGuideDbFailureInfo = {
  errorCode: string;
  errorDetails?: string | null;
  timestamp?: string | null;
};

export type CreateGuideDbResponseData = {
  status: 'created' | 'failed';
  kraftId: string;
  provider: ProviderSource;
  failureInfo: CreateGuideDbFailureInfo | null;
};

export type CreateGuideDbResponse = {
  version: string;
  message: string | null;
  error: string | null;
  data: CreateGuideDbResponseData;
};

export type DeleteGuideDbResponse = {
  version: string;
  message: string | null;
  error: string | null;
  data: { guide: { kraftId: string } };
};

export type GuidesDbStatus = 'created' | 'failed';

export type GuideDbFailureInfo = {
  errorCode: string;
  errorDetails?: string | null;
  timestamp?: string | null;
};

export type UpdateGuideDbResponseData = {
  kraftId: string;
  externalId: string | null | undefined;
  shipmentNumber: string | null | undefined;
  status: GuidesDbStatus;
  provider: ProviderSource;
  carrier: string | null | undefined;
  price: string | null | undefined;
  guideLink: string | null | undefined;
  isProviderTrackingSynced: boolean;
  labelUrl: string | null | undefined;
  file: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null | undefined;
  deletedBy: string | null | undefined;
  failureInfo: GuideDbFailureInfo | null | undefined;
};

export type UpdateGuideDbResponse = {
  version: string;
  message: string | null;
  error: string | null;
  data: UpdateGuideDbResponseData;
};

export type GuideDbResultData = Pick<
  UpdateGuideDbResponseData,
  'status' | 'kraftId' | 'provider' | 'failureInfo'
>;

export type GuideDbAddress = {
  alias: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  street1: string;
  external_number: string;
  neighborhood: string;
  city: string;
  town: string;
  state: string;
  zipcode: string;
  country: string;
  reference: string;
};

export type GuideDbParcel = {
  length: number;
  width: number;
  height: number;
  weight: number;
  content: string;
  satProductId: string;
  value?: number;
  quantity?: number;
};

export type QuoteAdjustmentSourceReference = 'default' | 'custom';

export type GuideDbQuote = {
  id: string;
  service: string;
  total: number;
  typeService: QuoteTypeService | null;
  courier: QuoteCourier | null;
  qBaseRef?: number | null;
  qAdjFactor?: number | null;
  qAdjBasis?: number | null;
  qAdjMode?: string | null;
  qAdjSrcRef?: QuoteAdjustmentSourceReference | null;
};

export type GuideDbRecord = {
  kraftId: string;
  quote: GuideDbQuote;
  externalId?: string | null;
  trackingNumber?: string | null;
  shipmentNumber?: string | null;
  carrier?: string | null;
  price?: string | null;
  guideLink?: string | null;
  labelUrl?: string | null;
  file?: string | null;
  status: GuidesDbStatus;
  provider: ProviderSource;
  isProviderTrackingSynced: boolean;
  failureInfo: GuideDbFailureInfo | null;
  origin: GuideDbAddress;
  destination: GuideDbAddress;
  parcel: GuideDbParcel;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
};

type GuidesDbMonthFilter = {
  month: number;
  year: number;
  startDate?: never;
  endDate?: never;
};

type GuidesDbRangeFilter = {
  month?: never;
  year?: never;
  startDate: string;
  endDate: string;
};

export type GetGuidesDbParams = {
  page: number;
  limit?: 10 | 50 | 100;
  scope?: 'all' | 'own';
  includeDeleted?: boolean;
  includeInternalPricing?: boolean;
} & (GuidesDbMonthFilter | GuidesDbRangeFilter);

export type GetGuidesDbResponseData = {
  guides: GuideDbRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetGuidesDbResponse = {
  version: string;
  message: string | null;
  error: string | null;
  data: GetGuidesDbResponseData;
};

export type CreateGuideDbFormValues = {
  originAddress: CreateGuideAddressFormValuesMn;
  destinationAddress: CreateGuideAddressFormValuesMn;
  parcelInfo: {
    content: string;
    value: string;
    quantity: string;
    notifyMe: boolean;
  };
};

export type CreateGuideDbAddressFormValues = {
  alias: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  street1: string;
  external_number: string;
  neighborhood: string;
  city: string;
  town: string;
  state: string;
  zipcode: string;
  reference: string;
};

export type CreateAddressGEPayload = {
  zipcode: string;
  neighborhood: string;
  city: string;
  state: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  rfc: string;
  street: string;
  number: string;
  reference: string;
  alias: string;
};

//#region Responses

/**
 * This interface represents the structure of a product returned by the SAT API.
 */
export interface SatProduct {
  code: string;
  created_at: string;
  description: string;
  id: string;
  similar_words: null | string;
  updated_at: string;
}

/**
 * This interface is the formatted data to be used in the dropdown
 */
export interface SearchProduct {
  code: string;
  description: string;
}

/**
 * This interface represents the structure of the response from the SAT API when fetching products.
 */
export interface GetProductId {
  data: SatProduct[];
  meta: {
    authors: string[];
    copyright: string;
  };
}

/**
 * This interface represents the structure of the response from our API when fetching SAT products.
 */
export interface FetchSatProductsResponse {
  message: { error: unknown } | null;
  products: SearchProduct[];
}

export interface GlobalCreateGuideResponse {
  trackingNumber: string;
  shipmentNumber?: string | null;
  carrier: string;
  source: ProviderSource;
  price: string;
  guideLink: string | null;
  labelUrl: string | null;
  file: Base64URLString | null;
}

export interface CreateMnGuideResponse {
  data: {
    guide: GlobalCreateGuideResponse;
  };
  error: null;
  message: null;
  messages: string[];
  success: boolean;
  version: string;
}

export interface AddressGE {
  zipcode: string;
  city: string;
  state: string;
  neighborhood: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  rfc: string;
  addressName: string;
  externalNumber: string;
  reference: string;
  alias: string;
  id: string;
}

export interface GetAliasAddressesGEResponse {
  data: {
    aliases: string[];
    addresses: AddressGE[];
    pages: number;
    page: number;
  };
  error: null;
  message: null;
  messages: string[];
  success: boolean;
  version: string;
}

export interface DeleteGEAdressResponse {
  version: string;
  message: string;
  error: null;
  data: null;
}

export interface CreateAddressGEResponse {
  zipcode: string;
  neighborhood: string;
  city: string;
  state: string;
  street: string;
  number: string;
  reference: string;
  alias: string;
}

export interface AddressGuide {
  name: string;
  alias: string;
  street: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface GetGuidesData extends GlobalCreateGuideResponse {
  status: string;
  origin: AddressGuide;
  courier: QuoteCourier | null;
  content?: string | null; // Used in Pkk as it returns first not enough data.
  startDate?: string | null; // Used in Pkk as it returns first not enough data.
  destination: AddressGuide;
}

export interface GuideUI extends GetGuidesData {
  id: string;
  logoSrc: QuoteImage;
  hasBeenFetched: boolean; // state to fetch guide from Pkk
}

export interface GetGuidesResponse {
  version: string;
  error: null;
  messages: string[];
  data: {
    guides: GetGuidesData[];
  };
}

export interface GetSingleGuideResponse {
  version: string;
  error: null;
  messages: string[];
  data: {
    guide: GetGuidesData;
  };
}

//#region Schemas

export const AddPersonalDataFormSchema: ObjectSchema<PersonalDataFormValues> =
  object().shape(
    {
      name: string()
        .required("Nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
      lastName: string()
        .required("Apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres"),
      company: string()
        .nullable()
        .notRequired()
        .when("company", {
          is: (value: string) => value?.length,
          then: (rule) =>
            rule.min(
              2,
              "El nombre de la compañía debe tener al menos 2 caracteres",
            ),
        }),
      phone: string()
        .required("El teléfono es requerido")
        .matches(/^\d+$/, {
          excludeEmptyString: true,
          message: "El teléfono solo puede contener dígitos",
        })
        .min(10, "El teléfono debe tener 10 dígitos")
        .max(10, "El teléfono debe tener 10 dígitos"),
      email: emailOptionalValidation,
    },
    [
      ["company", "company"],
      ["email", "email"],
    ],
  );

export const CreateGuideAddressFormSchemaMn = AddPersonalDataFormSchema.concat(
  object().shape(
    {
      street1: string()
        .required("Calle es requerida")
        .min(2, "La calle debe tener al menos 2 caracteres"),
      neighborhood: string()
        .required("Colonia es requerida")
        .min(2, "La colonia debe tener al menos 2 caracteres"),
      external_number: string()
        .required("Número exterior es requerido")
        .matches(/^[a-zA-Z0-9]+$/, {
          excludeEmptyString: true,
          message: "El número exterior solo puede contener letras y números",
        })
        .min(1, "El número exterior debe tener al menos 1 carácter"),
      city: string()
        .required("Ciudad es requerida")
        .min(2, "La ciudad debe tener al menos 2 caracteres"),
      state: string()
        .required("Estado es requerido")
        .min(2, "El estado debe tener al menos 2 caracteres"),
      reference: string()
        .nullable()
        .notRequired()
        .when("reference", {
          is: (value: string) => value?.length,
          then: (rule) =>
            rule.min(
              2,
              "La referencia del domicilio debe tener al menos 2 caracteres",
            ),
        }),
      alias: string().notRequired(),
      town: string().notRequired(),
      zipcode: string().notRequired(),
    },
    [["reference", "reference"]],
  ),
)

export const ParcelInfoFormValuesFormSchema: ObjectSchema<ParcelInfoFormValues> =
  object({
    content: string()
      .required("Contenido es requerido")
      .min(2, "El contenido debe tener al menos 2 caracteres"),
    value: number()
      .typeError("Valor es requerido")
      .required("Valor es requerido")
      .min(1, "El valor debe ser al menos 1"),
    quantity: number()
      .typeError("Cantidad es requerida")
      .required("Cantidad es requerida")
      .min(1, "La cantidad debe ser al menos 1"),
  });

export const CreateGuideAddressFormSchemaTone: ObjectSchema<CreateGuideAddressFormValuesTone> =
  AddPersonalDataFormSchema.concat(
    object().shape(
      {
        street1: string()
          .required("Calle es requerida")
          .min(2, "La calle debe tener al menos 2 caracteres"),
        neighborhood: string()
          .required("Colonia es requerida")
          .min(2, "La colonia debe tener al menos 2 caracteres"),
        external_number: string()
          .required("Número exterior es requerido")
          .matches(/^[a-zA-Z0-9]+$/, {
            excludeEmptyString: true,
            message: "El número exterior solo puede contener letras y números",
          })
          .min(1, "El número exterior debe tener al menos 1 carácter"),
        town: string()
          .required("Municipio es requerido")
          .min(2, "El municipio debe tener al menos 2 caracteres"),
        state: string()
          .required("Estado es requerido")
          .min(2, "El estado debe tener al menos 2 caracteres"),
        reference: string()
          .nullable()
          .notRequired()
          .when("reference", {
            is: (value: string) => value?.length,
            then: (rule) =>
              rule.min(
                2,
                "La referencia del domicilio debe tener al menos 2 caracteres",
              ),
          }),
      },
      [["reference", "reference"]],
    ),
  );

export const ParcelInfoFormValuesSchema: ObjectSchema<ParcelInfoValues> =
  object({
    content: string()
      .required("Contenido es requerido")
      .min(2, "El contenido debe tener al menos 2 caracteres"),
  });

export const CreateGuideAddressFormSchemaPkk: ObjectSchema<CreateGuideAddressFormValuesPkk> =
  AddPersonalDataFormSchema.concat(
    object().shape({
      street1: string()
        .required("Calle es requerida")
        .min(2, "La calle debe tener al menos 2 caracteres"),
      neighborhood: string()
        .required("Colonia es requerida")
        .min(2, "La colonia debe tener al menos 2 caracteres"),
      city: string()
        .required("Ciudad es requerida")
        .min(2, "La ciudad debe tener al menos 2 caracteres"),
      state: string()
        .required("Estado es requerido")
        .min(2, "El estado debe tener al menos 2 caracteres"),
      zipcode: zipcodeValidation,
    }),
  );

export const PersonalInformationGEFormSchema: ObjectSchema<PersonalDataGEFormValues> =
  object().shape(
    {
      name: string()
        .required("Nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres"),
      phone: string()
        .required("El teléfono es requerido")
        .matches(/^\d+$/, {
          excludeEmptyString: true,
          message: "El teléfono solo puede contener dígitos",
        })
        .min(10, "El teléfono debe tener 10 dígitos")
        .max(10, "El teléfono debe tener 10 dígitos"),
      email: emailOptionalValidation,
      company: string()
        .nullable()
        .notRequired()
        .when("company", {
          is: (value: string) => value?.length,
          then: (rule) =>
            rule.min(
              2,
              "El nombre de la compañía debe tener al menos 2 caracteres",
            ),
        }),
      rfc: string()
        .nullable()
        .notRequired()
        .when("rfc", {
          is: (value: string) => value?.length,
          then: (rule) =>
            rule
              .min(13, "El RFC debe tener 13 caracteres")
              .max(13, "El RFC debe tener 13 caracteres"),
        }),
    },
    [
      ["email", "email"],
      ["company", "company"],
      ["rfc", "rfc"],
    ],
  );

export const CreateAddressGESchema: ObjectSchema<CreateAddressFormValuesGE> =
  PersonalInformationGEFormSchema.concat(
    object().shape(
      {
        street1: string()
          .required("Calle es requerida")
          .min(2, "La calle debe tener al menos 2 caracteres"),
        neighborhood: string()
          .required("Colonia es requerida")
          .min(2, "La colonia debe tener al menos 2 caracteres"),
        external_number: string()
          .required("Número exterior es requerido")
          .matches(/^[a-zA-Z0-9]+$/, {
            excludeEmptyString: true,
            message: "El número exterior solo puede contener letras y números",
          })
          .min(1, "El número exterior debe tener al menos 1 carácter"),
        city: string()
          .required("Ciudad es requerida")
          .min(2, "La ciudad debe tener al menos 2 caracteres"),
        state: string()
          .required("Estado es requerido")
          .min(2, "El estado debe tener al menos 2 caracteres"),
        zipcode: zipcodeValidation,
        alias: string()
          .required("El alias del domicilio es requerido")
          .min(2, "El alias del domicilio debe tener al menos 2 caracteres"),
        reference: string()
          .nullable()
          .notRequired()
          .when("reference", {
            is: (value: string) => value?.length,
            then: (rule) =>
              rule.min(
                2,
                "La referencia del domicilio debe tener al menos 2 caracteres",
              ),
          }),
      },
      [["reference", "reference"]],
    ),
  );
