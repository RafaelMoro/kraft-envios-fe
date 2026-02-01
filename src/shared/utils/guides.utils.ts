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
} from "../constants/guides.constants";
import {
  CreateGuideMnPayload,
  CreateGuideTonePayload,
  CreateMnGuideResponse,
  // FetchSatProductsResponse,
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
} from "../types/guides.types";
import { CreateAddressFormValues } from "../types/addresses.types";

export const getProductSatInfo = async (data: GetProductSatIdPayload) => {
  try {
    const uri = `https://sat.api.hydraship.app/api/products?search=${replaceSpacesWithPlus(data.search)}`;
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
  console.log("res?.data from cb", res?.data);
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
