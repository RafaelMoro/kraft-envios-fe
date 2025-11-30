"use client"

import { Badge, Label, TextInput } from "flowbite-react"
import { useState } from "react";

interface AddTagProps {
  label: string;
  text: string;
  placeholder?: string
}

export const AddTag = ({ label, text, placeholder = "Presiona Enter para agregar" }: AddTagProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      setTags((prevTags) => [...prevTags, inputValue.trim()]);
      setInputValue("");
    }
  }

  return (
    <div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor={label}>{text}</Label>
        </div>
        <TextInput
          data-testid={label}
          id={label}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddTag}
        />
        {/* { errors?.city?.message && (
          <ErrorMessage>{errors.city?.message}</ErrorMessage>
        )} */}
      </div>
      <div className="flex gap-3 flex-wrap mt-3">
        { tags.length > 0 && tags.map((tag) => (
          <Badge color="info" size="xs" key={tag}>{tag}</Badge>
        ))}
      </div>
    </div>
  )
}