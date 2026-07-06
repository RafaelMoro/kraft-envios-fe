import axios, { AxiosResponse } from "axios";
import {
  CREATE_GUIDE_MN_ENDPOINT,
  CREATE_GUIDE_TONE_ENDPOINT,
  DEFAULT_COMPANY,
  DEFAULT_EMAIL,
  DEFAULT_REFERENCE,
  CREATE_GUIDE_PKK_ENDPOINT,
  GET_ALIAS_ADDRESSES_GE_ENDPOINT,
  CREATE_ADDRESS_GE_ENDPOINT,
  DEFAULT_RFC,
  CREATE_GUIDE_GE_ENDPOINT,
  CREATE_GUIDE_DB_ENDPOINT,
  GET_GUIDES_ENDPOINT,
  GUIDE_STATUS,
  GET_GUIDES_DB_ENDPOINT,
  GUIDE_DB_FAILURE_MESSAGES,
  GUIDE_DB_GENERIC_FAILURE_MESSAGE,
} from "../constants/guides.constants";
import {
  CreateGuideMnPayload,
  CreateGuideTonePayload,
  CreateMnGuideResponse,
  GetProductSatIdPayload,
  CreateGuideAddressFormValuesMn,
  CreateGuideAddressFormValuesTone,
  CreateGuideAddressValuesPkk,
  CreateGuidePkkPayload,
  CreateAddressGEResponse,
  CreateAddressGEPayload,
  CreateAddressFormValuesGE,
  CreateGuideGEPayload,
  GetProductId,
  SatProduct,
  SearchProduct,
  CreateGuideAddressPayloadMn,
  CreateGuideAddressPayloadTone,
  CreateGuideAddressPayloadPkk,
  AddressDataGEFormValues,
  PersonalDataGEFormValues,
  AddressGE,
  GetGuidesData,
  CreateGuideDbPayload,
  CreateGuideDbResponse,
  CreateGuideDbParcelPayload,
  CreateGuideDbFormValues,
  PackageDimensions,
  GetGuidesDbParams,
  GetGuidesDbResponse,
  GetGuidesDbResponseData,
  GuidesDbStatus,
  GuideDbFailureInfo,
} from "../types/guides.types";
import { CreateAddressFormValues } from "../types/addresses.types";

//#region Callbacks
export const getProductSatInfo = async (data: GetProductSatIdPayload) => {
  try {
    const satUri = process.env.NEXT_PUBLIC_GET_SAT_PRODUCT_URI
    if (!satUri) {
      return {
        products: [],
        message: {
          error: 'missing SAT products URI'
        }
      }
    }

    const uri = `${satUri}?search=${replaceSpacesWithPlus(data.search)}`;
    const res: AxiosResponse<GetProductId> = await axios.get(uri);
    const products: SatProduct[] = res?.data?.data?.slice(0, 100) || [];
    const formattedProducts: SearchProduct[] = products.map((prod) => ({
      code: prod.code,
      description: prod.description,
    }));
    return {
      message: null,
      products: formattedProducts,
    };
  } catch (error) {
    console.log("error sat product id", error);
    return {
      message: { error },
      products: [] as SearchProduct[],
    };
  }
};

export const createGuideMnCb = async (data: CreateGuideMnPayload) => {
  const res: AxiosResponse<CreateMnGuideResponse> = await axios.post(
    CREATE_GUIDE_MN_ENDPOINT,
    data,
  );
  return res?.data?.data?.guide;
};

export const createGuideToneCb = async (data: CreateGuideTonePayload) => {
  try {
    const res: AxiosResponse<CreateMnGuideResponse> = await axios.post(
      CREATE_GUIDE_TONE_ENDPOINT,
      data,
    );
    return res?.data?.data?.guide;
  } catch (error) {
    throw error;
  }
};

export const createGuidePkkCb = async (data: CreateGuidePkkPayload) => {
  try {
    const res: AxiosResponse<CreateMnGuideResponse> = await axios.post(
      CREATE_GUIDE_PKK_ENDPOINT,
      data,
    );
    return res?.data?.data?.guide;
  } catch (error) {
    throw error;
  }
};

export const createGuideGECb = async (data: CreateGuideGEPayload) => {
  try {
    const res: AxiosResponse<CreateMnGuideResponse> = await axios.post(
      CREATE_GUIDE_GE_ENDPOINT,
      data,
    );
    return res?.data?.data?.guide;
  } catch (error) {
    throw error;
  }
};

export const createGuideDbCb = async (
  data: CreateGuideDbPayload,
): Promise<CreateGuideDbResponse['data']> => {
  try {
    const res: AxiosResponse<CreateGuideDbResponse> = await axios.post(
      CREATE_GUIDE_DB_ENDPOINT,
      data,
    );
    return res?.data?.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Builds the Guides DB parcel payload by converting stored string dimensions to numbers
 * and attaching optional numeric fields only when supplied. Returns null when required
 * dimensions cannot be safely converted so callers can block submit before mutation.
 */
export const toGuideDbParcelPayload = (
  packageDimensions: PackageDimensions | null,
  parcelInfo: CreateGuideDbFormValues['parcelInfo'],
  satProductId: string,
): CreateGuideDbParcelPayload | null => {
  if (!packageDimensions) return null

  const { length, width, height, weight } = packageDimensions
  if (
    length === '' || width === '' || height === '' || weight === ''
  ) {
    return null
  }

  const numericLength = Number(length)
  const numericWidth = Number(width)
  const numericHeight = Number(height)
  const numericWeight = Number(weight)

  if (
    !Number.isFinite(numericLength) ||
    !Number.isFinite(numericWidth) ||
    !Number.isFinite(numericHeight) ||
    !Number.isFinite(numericWeight)
  ) {
    return null
  }

  const payload: CreateGuideDbParcelPayload = {
    length: numericLength,
    width: numericWidth,
    height: numericHeight,
    weight: numericWeight,
    content: parcelInfo.content,
    satProductId,
  }

  if (parcelInfo.value.trim() !== '') {
    const value = Number(parcelInfo.value)
    if (Number.isFinite(value)) {
      payload.value = value
    }
  }

  if (parcelInfo.quantity.trim() !== '') {
    const quantity = Number(parcelInfo.quantity)
    if (Number.isFinite(quantity)) {
      payload.quantity = quantity
    }
  }

  return payload
}

export const getGEAliasesCb = async (
  aliasesOnly?: boolean,
): Promise<string[]> => {
  try {
    const url =
      aliasesOnly !== undefined
        ? `${GET_ALIAS_ADDRESSES_GE_ENDPOINT}?aliasesOnly=${aliasesOnly}`
        : GET_ALIAS_ADDRESSES_GE_ENDPOINT;
    const res: AxiosResponse<{ aliases: string[] }> = await axios.get(url);
    const aliases = res?.data?.aliases ?? [];
    return aliases;
  } catch (error) {
    throw error;
  }
};

export const getGEAddressesCb = async (): Promise<AddressGE[]> => {
  try {
    const res: AxiosResponse<{ addresses: AddressGE[] }> = await axios.get(
      GET_ALIAS_ADDRESSES_GE_ENDPOINT,
    );
    const addresses = res?.data?.addresses ?? [];
    return addresses;
  } catch (error) {
    throw error;
  }
};

export const createAddressGECb = async (payload: CreateAddressGEPayload) => {
  try {
    const res: AxiosResponse<CreateAddressGEResponse> = await axios.post(
      CREATE_ADDRESS_GE_ENDPOINT,
      payload,
    );
    const data = res?.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const editAddressGECb = async ({
  payload, addressId, currentAlias
}: { payload: CreateAddressGEPayload, addressId: string, currentAlias: string}) => {
  try {
    const uri = `${CREATE_ADDRESS_GE_ENDPOINT}?addressId=${addressId}&currentAlias=${currentAlias}`;
    const res: AxiosResponse<CreateAddressGEResponse> = await axios.put(
      uri,
      payload,
    );
    const data = res?.data;
    return data;
  } catch (error) {
    throw error;
  }
}

export const getGuidesCb = async() => {
  try {
    const res: AxiosResponse<{ guides: GetGuidesData[], messages: string[]}> = await axios.get(
      GET_GUIDES_ENDPOINT,
    );
    const data = res?.data;
    return data;
  } catch (error) {
    throw error;
  }
}

export const getPkkGuide = async (guide: string) => {
  try {
    const uri = `${CREATE_GUIDE_PKK_ENDPOINT}?guide=${guide}`;
    const res: AxiosResponse<{ guide: GetGuidesData }> = await axios.get(uri);
    const data = res?.data;
    return data;
  } catch (error) {
    throw error;
  }
}

//#region Utils Fn
/**
 * Formats a Date object to Spanish localized date and time components with abbreviated month
 * @param date - The date to format
 * @returns An object containing three formatted strings:
 *   - fullDateTime: Complete date and time in "MMM DD, HH:MM am/pm" format
 *   - date: Date only in "MMM DD" format
 *   - time: Time only in "HH:MM am/pm" format
 * @example 
 * formatDateToSpanish(new Date('2024-03-13T13:13:00'))
 * // Returns: { fullDateTime: 'Mar 13, 01:13 pm', date: 'Mar 13', time: '01:13 pm' }
 */
export const formatDateToSpanish = (date: Date) => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const dateFormatted = `${month} ${day}`
  const timeFormatted = `${formattedHours}:${formattedMinutes} ${ampm}`;
  
  return {
    fullDateTime: `${dateFormatted}, ${timeFormatted}`,
    date: dateFormatted,
    time: timeFormatted
  };
};

/**
 * Maps guide status values to their Spanish display labels
 * @param status - The status value from the guide
 * @returns Spanish label for the status
 * @example getGuideStatusLabel('WAITING') => 'En espera'
 */
export const getGuideStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'WAITING': 'En espera',
    'ON_DELIVERY': 'En proceso de entrega',
    'IN_TRANSIT': 'En tránsito',
    'DELIVERED': 'Entregado',
  };
  
  return statusMap[status] || status;
};

/**
 * Replace whitespace characters with plus signs in a string.
 * Useful for URL encoding or API query formatting.
 * @param input - The input string to process
 * @returns The string with whitespace replaced by plus signs
 * @example replaceSpacesWithPlus('food and water') => 'food+and+water'
 */
export const replaceSpacesWithPlus = (input: string): string => {
  return input.replace(/\s+/g, "+");
};

/**
 * Verifies and updates address data by replacing empty optional fields with default values
 * @param address - The address object to verify and update
 * @returns Updated address object with default values for empty optional fields
 */
export const verifyAndUpdateAddressMn = (
  address: CreateGuideAddressFormValuesMn,
): CreateGuideAddressPayloadMn => {
  const { lastName, ...restData } = address;
  const formattedAddress = {
    ...restData,
    name: `${address.name} ${lastName}`.trim(),
  };
  return {
    ...formattedAddress,
    company: address.company?.trim() || DEFAULT_COMPANY,
    email: address.email?.trim() || DEFAULT_EMAIL,
    reference: address.reference?.trim() || DEFAULT_REFERENCE,
  };
};

/**
 * Verifies and updates address data by replacing empty optional fields with default values
 * @param address - The address object to verify and update
 * @returns Updated address object with default values for empty optional fields
 */
export const verifyAndUpdateAddressTone = (
  // It may contain zipcode and city because of the autocomplete zipcode feature
  address: CreateGuideAddressFormValuesTone & { zipcode?: string; city?: string} ,
): CreateGuideAddressPayloadTone => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { company, zipcode, city, ...restData } = address;
  return {
    ...restData,
    email: address.email?.trim() || DEFAULT_EMAIL,
    reference: address.reference?.trim() || DEFAULT_REFERENCE,
  };
};

/**
 * Verifies and updates address data by replacing empty optional fields with default values
 * @param address - The address object to verify and update
 * @returns Updated address object with default values for empty optional fields
 */
export const verifyAndUpdateAddressPkk = (
  address: CreateGuideAddressValuesPkk,
): CreateGuideAddressPayloadPkk => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { phone, lastName, company, ...rest } = address;
  const newPhone = `+52${phone}`;
  return {
    ...rest,
    phone: newPhone,
    name: `${address.name} ${lastName}`.trim(),
    email: address.email?.trim() || DEFAULT_EMAIL,
  };
};

/**
 * Fills empty optional email/company/reference fields with defaults and combines
 * name + lastName for the Guides DB confirm step. The caller is responsible for
 * assembling the rest of the address payload (street, city, alias, town, zipcode, country).
 * @param address - The personal/contact fields from the address form
 * @returns Verified personal/contact fields with defaults applied
 */
export const verifyAndUpdateAddressGuideDb = (
  address: Pick<CreateGuideAddressFormValuesMn, 'name' | 'lastName' | 'phone' | 'email' | 'company' | 'reference'>,
): { name: string; lastName: string; phone: string; email: string; company: string; reference: string } => {
  return {
    name: `${address.name ?? ''} ${address.lastName ?? ''}`.trim(),
    lastName: address.lastName ?? '',
    phone: address.phone ?? '',
    email: address.email?.trim() || DEFAULT_EMAIL,
    company: address.company?.trim() || DEFAULT_COMPANY,
    reference: address.reference?.trim() || DEFAULT_REFERENCE,
  }
}

/**
 * Converts CreateAddressFormValuesGE to CreateAddressGEPayload
 * Maps form field names to API payload field names and ensures required fields
 * @param formValues - The form values object to convert
 * @returns Converted payload object for the API
 */
export const convertToCreateAddressGEPayload = (
  formValues: CreateAddressFormValuesGE,
): CreateAddressGEPayload => {
  return {
    zipcode: formValues.zipcode,
    neighborhood: formValues.neighborhood,
    city: formValues.city,
    state: formValues.state,
    name: formValues.name,
    email: formValues.email?.trim() || DEFAULT_EMAIL,
    phone: formValues.phone,
    company: formValues.company?.trim() || DEFAULT_COMPANY,
    rfc: formValues.rfc?.trim() || DEFAULT_RFC,
    street: formValues.street1,
    number: formValues.external_number,
    reference: formValues.reference?.trim() || DEFAULT_REFERENCE,
    alias: formValues.alias,
  };
};

/**
 * Converts CreateAddressFormValues to AddressDataGEFormValues
 * Maps form field names and takes the first city from the cities array
 * @param formValues - The form values object to convert
 * @param cities - Array of cities, will use the first element
 * @returns Converted payload object for GE address form
 */
export const convertToAddressDataGEFormValues = ({
  formValues,
  cities,
  showManualFields,
  automaticZipcode,
  neighborhoodSelected,
  stateSelected,
  citySelected,
}: {
  formValues: CreateAddressFormValues;
  cities: string[];
  automaticZipcode: string;
  neighborhoodSelected: string;
  stateSelected: string;
  citySelected: string;
  showManualFields: boolean;
}): AddressDataGEFormValues => {
  if (!showManualFields) {
    return {
      street1: formValues.street1,
      external_number: formValues.externalNumber,
      neighborhood: neighborhoodSelected,
      city: citySelected,
      state: stateSelected,
      zipcode: automaticZipcode,
      reference: formValues.reference,
      alias: formValues.alias,
    };
  }

  return {
    street1: formValues.street1,
    external_number: formValues.externalNumber,
    neighborhood: formValues.neighborhood,
    city: cities[0] || "",
    state: formValues.state,
    zipcode: formValues.zipcode,
    reference: formValues.reference,
    alias: formValues.alias,
  };
};

/**
 * Combines PersonalDataGEFormValues and AddressDataGEFormValues into CreateAddressGEPayload
 * Applies default values for optional fields (email, company, rfc, reference) if not provided
 * Maps form field names to API payload field names
 * @param personalData - The personal data form values
 * @param addressData - The address data form values
 * @returns Converted payload object for the API
 */
export const combineGEFormValues = (
  personalData: PersonalDataGEFormValues,
  addressData: AddressDataGEFormValues,
): CreateAddressGEPayload => {
  return {
    name: personalData.name,
    phone: personalData.phone,
    email: personalData.email?.trim() || DEFAULT_EMAIL,
    company: personalData.company?.trim() || DEFAULT_COMPANY,
    rfc: personalData.rfc?.trim() || DEFAULT_RFC,
    street: addressData.street1,
    number: addressData.external_number,
    neighborhood: addressData.neighborhood,
    city: addressData.city,
    state: addressData.state,
    zipcode: addressData.zipcode,
    reference: addressData.reference?.trim() || DEFAULT_REFERENCE,
    alias: addressData.alias,
  };
};

export const b64toBlob = (
  b64Data: Base64URLString,
  contentType = "",
  sliceSize = 512,
) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const getGuideStatus = (status: string) => {
  if (status.match(/created/i)) {
    return GUIDE_STATUS.created
  }
  if (status.match(/in process/i)) {
    return GUIDE_STATUS.inProcess
  }
  if (status.match(/transit/i)) {
    return GUIDE_STATUS.transit
  }
  return GUIDE_STATUS.inProcess
}

/**
 * Generates a unique identifier for a guide based on its source and tracking number
 * @param guide - The guide object containing source and tracking information
 * @returns A unique string identifier in the format "SOURCE-TRACKING_NUMBER"
 * @example generateGuideId({ source: 'Pkk', trackingNumber: '123456' }) => 'Pkk-123456'
 */
export const generateGuideId = (guide: GetGuidesData): string => {
  return `${guide.source}-${guide.trackingNumber}`;
};

export const getGuidesDbCb = async (params: GetGuidesDbParams): Promise<GetGuidesDbResponseData> => {
  const searchParams = new URLSearchParams();
  searchParams.append('page', String(params.page));
  searchParams.append('month', String(params.month));
  searchParams.append('year', String(params.year));
  if (params.limit !== undefined && params.limit !== 10) {
    searchParams.append('limit', String(params.limit));
  }
  if (params.scope === 'all' || params.scope === 'own') {
    searchParams.append('scope', params.scope);
  }
  if (params.includeDeleted === true) {
    searchParams.append('includeDeleted', 'true');
  }
  if (params.includeInternalPricing === true) {
    searchParams.append('includeInternalPricing', 'true');
  }

  const res: AxiosResponse<GetGuidesDbResponse> = await axios.get(
    `${GET_GUIDES_DB_ENDPOINT}?${searchParams}`,
  );
  return res.data.data;
};

export const getGuideDbStatusLabel = (status: GuidesDbStatus): string => {
  return status === 'created' ? 'Creado' : 'Fallido';
};

export const getGuideDbFailureMessage = (failureInfo: GuideDbFailureInfo | null): string | null => {
  if (!failureInfo) return null;
  const { errorCode } = failureInfo;
  const friendlyMessage = GUIDE_DB_FAILURE_MESSAGES[errorCode] ?? GUIDE_DB_GENERIC_FAILURE_MESSAGE;
  return `${errorCode}: ${friendlyMessage}`;
};
