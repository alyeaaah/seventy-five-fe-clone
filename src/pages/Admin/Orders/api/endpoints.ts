import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { merchProductsItemSchema, merchProductPayloadSchema, orderSchema } from "./schema";


const MerchProductsListApi = makeEndpoint({
  alias: "getMerchProducts",
  method: "get",
  path: `/products`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(merchProductsItemSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});

const MerchProductsDetailApi = makeEndpoint({
  alias: "getMerchProductsDetail",
  method: "get",
  path: `/products/:uuid`,
  response: z
    .object({
      data: merchProductsItemSchema,
    })
});

const MerchProductsCreateApi = makeEndpoint({
  alias: "createMerchProducts",
  method: "post",
  path: `/products`,
  parameters: parametersBuilder().addBody(merchProductPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});

const MerchProductsUpdateApi = makeEndpoint({
  alias: "updateMerchProducts",
  method: "put",
  path: `/products/:uuid`,
  parameters: parametersBuilder().addBody(merchProductPayloadSchema).build(),
  response: z
    .object({
      message: z.string(),
    })
});
const MerchProductsDeleteApi = makeEndpoint({
  alias: "deleteMerchProducts",
  method: "delete",
  path: `/products/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const MerchProductsToggleFeaturedApi = makeEndpoint({
  alias: "toggleFeaturedMerchProducts",
  method: "put",
  path: `/products/toggle-featured/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const MerchOrderListApi = makeEndpoint({
  alias: "getMerchOrderList",
  method: "get",
  path: `/orders`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(orderSchema),
      currentPage: z.number().nullish(),
      totalRecords: z.number().nullish(),
      totalPages: z.number().nullish()
    })
});

const MerchOrderDetailApi = makeEndpoint({
  alias: "getMerchOrderDetail",
  method: "get",
  path: `/orders/:uuid`,
  response: z
    .object({
      data: orderSchema,
    })
});

const MerchOrderUpdateStatusApi = makeEndpoint({
  alias: "updateMerchOrderStatus",
  method: "put",
  path: `/orders/:uuid`,
  parameters: parametersBuilder().addBody(z.object({
    status: z.enum(["ORDERED", "PROCESSED", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED"]),
    shipping_code: z.string().nullish(),
    note: z.string().nullish(),
  })).build(),
  response: z
    .object({
      message: z.string(),
    })
});

export const endpoints = {
  MerchProductsListApi,
  MerchProductsDetailApi,
  MerchProductsCreateApi,
  MerchProductsUpdateApi,
  MerchProductsDeleteApi,
  MerchProductsToggleFeaturedApi,
  MerchOrderListApi,
  MerchOrderDetailApi,
  MerchOrderUpdateStatusApi
};