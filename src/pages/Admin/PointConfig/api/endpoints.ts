import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import { pointConfigurationDetailSchema, pointConfigurationFormSchema, pointConfigurationsSchema } from "./schema";


const PointConfigurationsListApi = makeEndpoint({
  alias: "getPointConfigurationsList",
  method: "get",
  path: `/point-config`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      round: z.number().optional(),
  }).build(),
  response: z
    .object({
      data: z.array(pointConfigurationsSchema),
      currentPage: z.number(),
      totalRecords: z.number(),
      totalPages: z.number()
    })
});
const PointConfigurationsDropdownApi = makeEndpoint({
  alias: "getPointConfigurationsDropdown",
  method: "get",
  path: `/point-config/dropdown`,
  parameters: parametersBuilder().addQueries
    ({
      search: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    }).build(),
  response: z
    .object({
      data: z.array(pointConfigurationsSchema),
    })
});

const PointConfigurationsDetailApi = makeEndpoint({
  alias: "getPointConfigurationsDetail",
  method: "get",
  path: `/point-config/detail/:uuid`,
  response: z
    .object({
      data: pointConfigurationDetailSchema,
    })
});

const PointConfigurationsCreateApi = makeEndpoint({
  alias: "createPointConfiguration",
  method: "post",
  path: `/point-config/create`,
  parameters: parametersBuilder().addBody(pointConfigurationFormSchema).build(),
  response: z
    .object({
      data: pointConfigurationsSchema,
    })
});

const PointConfigurationsUpdateApi = makeEndpoint({
  alias: "updatePointConfiguration",
  method: "put",
  path: `/point-config/edit/:uuid`,
  parameters: parametersBuilder().addBody(pointConfigurationFormSchema).build(),
  response: z
    .object({
      data: pointConfigurationsSchema,
    })
});

const PointConfigurationsDeleteApi = makeEndpoint({
  alias: "deletePointConfiguration",
  method: "delete",
  path: `/point-config/delete/:uuid`,
  response: z
    .object({
      message: z.string(),
    })
});

const PointConfigurationsSetDefaultApi = makeEndpoint({
  alias: "setDefaultPointConfiguration",
  method: "put",
  path: `/point-config/:uuid/set-default`,
  response: z
    .object({
      message: z.string().optional(),
    })
    .passthrough()
});

export const endpoints = {
  PointConfigurationsListApi,
  PointConfigurationsDropdownApi,
  PointConfigurationsCreateApi,
  PointConfigurationsUpdateApi,
  PointConfigurationsDeleteApi,
  PointConfigurationsDetailApi,
  PointConfigurationsSetDefaultApi
};