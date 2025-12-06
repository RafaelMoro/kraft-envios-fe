"use client"

import { useQuery } from "@tanstack/react-query"
import { getAddressesCb } from "../utils/addresses.utils"

export const useGetAddress = () => {
  const { data, refetch, isPending, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesCb
  })

  return {
    data,
    refetch,
    isPending,
    isError
  }
}