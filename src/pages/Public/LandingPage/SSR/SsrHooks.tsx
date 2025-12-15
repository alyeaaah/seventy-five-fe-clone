// utils/ssrHooks.ts
import { PublicBlogApiClient } from '@/pages/Public/Blog/api';
import { QueryClient } from '@tanstack/react-query';

export const prefetchBlogPosts = async (queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ['publicBlog', 'getBlogPosts'],
    queryFn: async () => {
      const response = await PublicBlogApiClient.getBlogPosts();
      return response; // Zod validation is already handled by Zodios
    },
  });
}