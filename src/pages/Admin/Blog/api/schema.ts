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
  featured_at: z.string().nullish(),
  author: z.string(),
  tags: z.array(BlogTagSchema).nullish(),
  galleries: z.array(BlogGallerySchema).nullish(),
  image_cover: z.string(),
});


export const blogPostPayloadSchema = z.object({
  uuid: z.string().optional(),
  title: z.string({ required_error: "Title is required" }).min(4,{message: "Title must be at least 4 characters long"}),
  content: z.string({ required_error: "Content is required" }).min(12,{message: "Content must be at least 12 characters long"}),
  image_cover: z.string({ required_error: "Image cover is required" }).min(4,{message: "Image cover is required"}),
  category_uuid: z.string().nullish(),
  tags: z.array(z.object({
    uuid: z.string().nullish(),
    tag_uuid: z.string().nullish(),
    name: z.string().nullish(),
    is_delete: z.boolean().default(false).nullish()
  })).nullish()
});

export type BlogPostsData = z.infer<typeof blogPostsItemSchema>;
export type BlogPostPayload = z.infer<typeof blogPostPayloadSchema>;


