import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { categoriesPayloadSchema, categoriesSchema } from "./schema";


const CategoriesListApi = makeEndpoint({
  alias: "getCategoriesList",
  method: "get",
  path: `/categories`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(categoriesSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const CategoriesCreateApi = makeEndpoint({
  alias: "createCategory",
  method: "post",
  path: `/categories`,
  request: categoriesPayloadSchema,
  response: z
    .object({
      data: categoriesSchema,
    })
});

const CategoriesUpdateApi = makeEndpoint({
  alias: "updateCategory",
  method: "put",
  path: `/categories/:uuid`,
  request: categoriesPayloadSchema,
  response: z
    .object({
      data: categoriesSchema,
    })
});

const CategoriesDeleteApi = makeEndpoint({
  alias: "deleteCategory",
  method: "delete",
  path: `/categories/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  CategoriesListApi,
  CategoriesCreateApi,
  CategoriesUpdateApi,
  CategoriesDeleteApi
};