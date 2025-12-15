import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { blogPostsItemSchema } from "./schema";


const BlogPostsListApi = makeEndpoint({
  alias: "getBlogPosts",
  method: "get",
  path: `/public/blog`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(blogPostsItemSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});
const BlogPostsDetailApi = makeEndpoint({
  alias: "getBlogDetail",
  method: "get",
  path: `/public/blog/:uuid`,
  response: z
    .object({
      data: blogPostsItemSchema
    })
});
const BlogFeaturedListApi = makeEndpoint({
  alias: "getBlogFeatured",
  method: "get",
  path: `/public/blog/featured`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(blogPostsItemSchema),
      currentPage: z.number(),
    })
});

export const endpoints = {
  BlogPostsListApi,
  BlogFeaturedListApi,
  BlogPostsDetailApi
};