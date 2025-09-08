"use client"
import { useState } from "react"
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from "flowbite-react"
import { ErrorMessage } from "@/shared/ui/atoms/ErrorMessage";
import { QuoteUI } from "@/shared/types/quotes.types";
import { formatQuotesSendWhatsapp } from "@/shared/utils/quotes.utils";

interface CopyInfoQuotesModalProps {
  open: boolean;
  selectedQuotes: QuoteUI[]
  toggleModal: () => void;
}

export const CopyInfoQuotesModal = ({ open, toggleModal, selectedQuotes }: CopyInfoQuotesModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    if (phoneError) setPhoneError(null)
  }

  const sendWhatsappMessage = () => {
    const message = formatQuotesSendWhatsapp(selectedQuotes)
    const completeMessage = `Hola Rafael. Las cotizaciones son: ${message}`
    const whatsappUrl = `https://wa.me/52${phoneNumber}?text=${encodeURIComponent(completeMessage)}`
    return whatsappUrl
  }

  const handleSendInfo = () => {
    // Validate phone number has exactly 10 digits
    if (phoneNumber.length !== 10) {
      setPhoneError("El número de teléfono debe tener exactamente 10 dígitos")
      return
    }

    const whatsappUrl = sendWhatsappMessage()
    
    // Redirect to WhatsApp URL
    window.open(whatsappUrl, '_blank')
    
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