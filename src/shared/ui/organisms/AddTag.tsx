"use client"

import { RiCloseCircleLine } from "@remixicon/react";
import { Badge, Label, TextInput } from "flowbite-react"
import { useState } from "react";

interface AddTagProps {
  label: string;
  text: string;
  tags: string[];
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  placeholder?: string
}

export const AddTag = ({ label, text, tags, addTag, removeTag, placeholder = "Presiona Enter para agregar" }: AddTagProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      addTag(inputValue.trim());
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
          <Badge color="info" size="xs" key={tag}>
            <div className="inline-flex gap-1">
              <button onClick={() => removeTag(tag)}>
                <RiCloseCircleLine size={18} />
              </button>
              {tag}
            </div>
          </Badge>
        ))}
      </div>
    </div>
  )
}