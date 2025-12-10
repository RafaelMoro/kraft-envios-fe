import { useAddAddress } from "@/shared/hooks/useAddAddress";
import { AliasSaved, CreateGuideAddressValuesPkk } from "@/shared/types/guides.types";
import { AddTempAddressPkk } from "./AddTempAddressPkk";

interface AddAddressPkkProps {
  isDestination?: boolean
  addressData: CreateGuideAddressValuesPkk;
  // TODO: Change this to the correct type for Pkk
  aliasSaved: AliasSaved
  goNext: () => void
  goPrev: () => void
  toggleModal: () => void
  updateAddress: (data: CreateGuideAddressValuesPkk) => void
}

export const AddAddressPkk = ({
  isDestination = false, addressData, aliasSaved, goPrev, goNext, toggleModal, updateAddress
}: AddAddressPkkProps) => {
  const {
    aliasSelected,
    setAliasSelected,
    addressError,
    setAddressError,
    townError,
    cityError,
    setTownError,
    setCityError,
    handleCancel,
    addressType,
    cancelButtonText,
    cancelColorButton,
    useTempAddress,
    toggleTempAddress
  } = useAddAddress({ isDestination, alias: aliasSaved.alias, toggleModal, goPrev });

  if (useTempAddress) {
    return (
      <AddTempAddressPkk
        isDestination={isDestination}
        addressData={addressData}
        goNext={goNext}
        goPrev={goPrev}
        updateOriginAddress={updateAddress}
        toggleModal={toggleTempAddress}
      />
    )
  }

  return (
    <form
      // onSubmit={handleSubmit(onSubmit)}
    >

    </form>
  )
}