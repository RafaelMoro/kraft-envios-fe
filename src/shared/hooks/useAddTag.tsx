"use client"
import { useState } from "react";

/**
 * This hook manages a list of tags (strings) with functions to add and remove tags. It's used with AddTag component.
 */
export const useAddTag = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const addTag = (town: string) => {
    setTags((prevTowns) => [...prevTowns, town]);
  }
  const removeTag = (town: string) => {
    setTags((prevTowns) => prevTowns.filter((t) => t !== town));
  }

  const validateTagsEmpty = () => {
    return tags.length === 0;
  }

  return {
    tags,
    error,
    addTag,
    removeTag,
    validateTagsEmpty,
    setError,
  }
}