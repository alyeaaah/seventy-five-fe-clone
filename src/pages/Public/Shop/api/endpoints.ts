import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { merchProductsItemSchema } from "@/pages/Admin/Merchandise/api/schema";
import { checkoutPayloadSchema, citySchema, districtSchema, provinceSchema } from "./schema";


const featuredMerchApi = makeEndpoint({
  alias: "getFeaturedMerchandise",
  method: "get",
  path: `/public/merchandise/featured`,
  parameters: parametersBuilder().addQueries
    ({
      page: z.number().optional(),
      limit: z.number().optional(),
  }).build(),
  response: z.object({
    data: z.array(merchProductsItemSchema)
  })
});
const detailMerchApi = makeEndpoint({
  alias: "getMerchandiseDetail",
  method: "get",
  path: `/public/merchandise/:uuid`,
  response: z.object({
    data: merchProductsItemSchema
  })
});

const checkoutApi = makeEndpoint({
  alias: "checkoutMerchandise",
  method: "post",
  path: `/public/merchandise/checkout`,
  parameters: parametersBuilder().addBody(checkoutPayloadSchema).build(),
  response: z.object({
    message: z.string(),
  })
});

const provinceListApi = makeEndpoint({
  alias: "getProvinceList",
  method: "get",
  path: `/address/province`,
  response: z
    .object({
      data: z.array(provinceSchema),
    })
});

const cityListApi = makeEndpoint({
  alias: "getCityList",
  method: "get",
  path: `/address/city`,
  parameters: parametersBuilder().addQueries
    ({
      province_id: z.number().optional(),
    }).build(),
  response: z
    .object({
      data: z.array(citySchema),
    })
});

const districtListApi = makeEndpoint({
  alias: "getDistrictList",
  method: "get",
  path: `/address/district`,
  parameters: parametersBuilder().addQueries
    ({
      city_id: z.number().optional(),
    }).build(),
  response: z
    .object({
      data: z.array(districtSchema),
    })
});

const shippingFeeApi = makeEndpoint({
  alias: "getShippingFee",
  method: "get",
  path: `/public/merchandise/shipping-fee`,
  parameters: parametersBuilder().addQueries({
    destination: z.number(),
    weight: z.number(),
  }).build(),
  response: z
    .object({
      data: z.object({
        name: z.string(),
        cost: z.number(),
        service: z.string(),
        description: z.string(),
        etd: z.string(),
      }),
    })
});


export const endpoints = {
  featuredMerchApi,
  detailMerchApi,
  provinceListApi,
  cityListApi,
  districtListApi,
  checkoutApi,
  shippingFeeApi  
};