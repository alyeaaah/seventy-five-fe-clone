import { z } from "zod";

const BlogTagSchema = z.object({
  name: z.string(),
  tag_uuid: z.string().uuid(),
  uuid: z.string().uuid().nullish(),
});

const BlogGallerySchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  link: z.string(),
});
export const blogPostsItemSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  title: z.string(),
  content: z.string(),
  category_uuid: z.string().nullish(),
  status: z.enum(['DRAFT', 'PUBLISHED']), // Assuming possible statuses
  read: z.number().default(0),
  createdAt: z.string().nullish(),  
  createdBy: z.string().nullish(),
  updatedAt: z.string().nullish(),
  updatedBy: z.string().nullish(),
  deletedBy: z.string().nullish(),
  author: z.string(),
  tags: z.array(BlogTagSchema).nullish(),
  galleries: z.array(BlogGallerySchema).nullish(),
  image_cover: z.string(),
});

export type BlogPostsData = z.infer<typeof blogPostsItemSchema>;


