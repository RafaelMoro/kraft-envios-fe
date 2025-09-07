import { useState } from "react"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from "flowbite-react"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";

interface CopyInfoQuotesModalProps {
  open: boolean;
  toggleModal: () => void;
}

export const CopyInfoQuotesModal = ({ open, toggleModal }: CopyInfoQuotesModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    if (phoneError) setPhoneError(null)
  }

  const handleSendInfo = () => {
    // Validate phone number has exactly 10 digits
    if (phoneNumber.length !== 10) {
      setPhoneError("El número de teléfono debe tener exactamente 10 dígitos")
      return
    }

    // TODO: Implement the logic to send quote information via WhatsApp
    console.log("Sending quote info to:", phoneNumber)
    
    // Reset form and close modal
    setPhoneNumber("")
    setPhoneError(null)
    toggleModal()
  }
  return (
    <Modal show={open} onClose={toggleModal}>
        <ModalHeader>Copiar información via Whatsapp</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Ingrese el whatsapp para enviar la información de las cotizaciones seleccionadas.
            </p>
            <div>
              <TextInput
                id="phoneNumber"
                placeholder="5512345678"
                type="number"
                inputMode="numeric"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
              {phoneError && (
                <ErrorMessage>{phoneError}</ErrorMessage>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="red" onClick={toggleModal} outline>
            Cancelar
          </Button>
          <Button onClick={handleSendInfo}>Enviar</Button>
        </ModalFooter>
      </Modal>
  )
}