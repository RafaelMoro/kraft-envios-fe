"use client"
import { useState } from "react";

export const useAddTag = () => {
  const [tags, setTags] = useState<string[]>([]);
  const addTag = (town: string) => {
    setTags((prevTowns) => [...prevTowns, town]);
  }
  const removeTag = (town: string) => {
    setTags((prevTowns) => prevTowns.filter((t) => t !== town));
  }

  return {
    tags,
    addTag,
    removeTag
  }
}