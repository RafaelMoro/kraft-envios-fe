"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getAddressesCb } from "../utils/addresses.utils"

export const useGetAddress = () => {
  const [aliases, setAliases] = useState<string[]>([])
  const { data, refetch, isPending, isError } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddressesCb
  })

  useEffect(() => {
    if (data) {
      const fetchedAliases = data.map(address => address.alias)
      setAliases(fetchedAliases)
    }
  }, [data])

  return {
    data,
    aliases,
    refetch,
    isPending,
    isError
  }
}