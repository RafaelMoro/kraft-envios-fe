"use client"
import { useState } from "react"
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Textarea, TextInput } from "flowbite-react"
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
  const [intro, setIntro] = useState<string>("")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [introError, setIntroError] = useState<string | null>(null)

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPhoneNumber(value)
    if (phoneError) setPhoneError(null)
  }

  const handleIntroChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setIntro(value)
    if (introError) setIntroError(null)
  }

  const sendWhatsappMessage = () => {
    const message = formatQuotesSendWhatsapp(selectedQuotes)
    const completeMessage = `Hola Rafael. Las cotizaciones son: ${message}`
    const whatsappUrl = `https://wa.me/52${phoneNumber}?text=${encodeURIComponent(completeMessage)}`
    return whatsappUrl
  }

  const handleSendInfo = () => {
    if (intro.length === 0) {
      setIntroError("El saludo no puede estar vacío")
      return
    }
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
              Ingrese un saludo y el whatsapp para enviar la información de las cotizaciones seleccionadas.
            </p>
            <div>
            <div className="mb-2 block">
                <Label htmlFor="intro">Saludo</Label>
              </div>
              <Textarea
                id="intro"
                rows={4}
                placeholder="Buenos días, las opciones de envíos son:"
                value={intro}
                onChange={handleIntroChange}
              />
              {introError && (
                <ErrorMessage>{introError}</ErrorMessage>
              )}
            </div>
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