"use client"
import { ReactNode, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// NEVER DO THIS:
// const queryClient = new QueryClient()
//
// Creating the queryClient at the file root level makes the cache shared
// between all requests and means _all_ data gets passed to _all_ users.
// Besides being bad for performance, this also leaks any sensitive data.

interface QueryProviderWrapperProps {
  children: ReactNode;
}

export function QueryProviderWrapper({ children }: QueryProviderWrapperProps) {
  // Instead do this, which ensures each request has its own cache:
  const queryClientRef = useRef<QueryClient>()
  if (!queryClientRef.current) {
     queryClientRef.current = new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
   }

  return (
    <QueryClientProvider client={queryClientRef.current!}>
      {children}
    </QueryClientProvider>
  )
}