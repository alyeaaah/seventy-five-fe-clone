
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export const SsrProvider = async ({ children, dehydratedState }: {
  children: ReactNode,
  dehydratedState?: any
}) => {
  const queryClient = new QueryClient();

  // Prefetch data (example)
  await queryClient.prefetchQuery({
    queryKey: ["data"],
    queryFn: () => fetch("https://api.example.com/data").then(res => res.json()),
  });

  // const dehydratedState = dehydrate(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        {children}
      </Hydrate>
    </QueryClientProvider>
  );
}