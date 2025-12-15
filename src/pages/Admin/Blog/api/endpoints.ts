import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { blogPostsItemSchema, blogPostPayloadSchema } from "./schema";


const BlogPostsListApi = makeEndpoint({
  alias: "getBlogPosts",
  method: "get",
  path: `/blogs`,
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
  alias: "getBlogPostsDetail",
  method: "get",
  path: `/blogs/:uuid`,
  response: z
    .object({
      data: blogPostsItemSchema,
    })
});

const BlogPostsCreateApi = makeEndpoint({
  alias: "createBlogPosts",
  method: "post",
  path: `/blogs`,
  parameters: parametersBuilder().addBody(blogPostPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

const BlogPostsUpdateApi = makeEndpoint({
  alias: "updateBlogPosts",
  method: "put",
  path: `/blogs/:uuid`,
  parameters: parametersBuilder().addBody(blogPostPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});
const BlogPostsDeleteApi = makeEndpoint({
  alias: "deleteBlogPosts",
  method: "delete",
  path: `/blogs/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const BlogPostToggleFeaturedApi = makeEndpoint({
  alias: "toggleBlogPostFeatured",
  method: "put",
  path: `/blogs/toggle-featured/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  BlogPostsListApi,
  BlogPostsDetailApi,
  BlogPostsCreateApi,
  BlogPostsUpdateApi,
  BlogPostsDeleteApi,
  BlogPostToggleFeaturedApi
};