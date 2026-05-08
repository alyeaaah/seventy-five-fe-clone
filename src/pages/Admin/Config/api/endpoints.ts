import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";
import {
  configSchema,
  createConfigSchema,
  updateConfigSchema,
  bulkConfigSchema,
  ConfigListResponse,
  ConfigResponse,
  BulkConfigResponse,
} from "./schema";

// Query parameters for list endpoint
const listQuerySchema = z.object({
  type: z.enum(["content", "version", "config"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

// Get all configs with pagination and filtering
export const getConfigsEndpoint = makeEndpoint({
  alias: "getConfigs",
  method: "get",
  path: "/config",
  parameters: parametersBuilder()
    .addQueries({
      ...listQuerySchema.shape
    })
    .build(),
  response: z.object({
    data: z.array(configSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});

// Get config by key
export const getConfigByKeyEndpoint = makeEndpoint({
  alias: "getConfigByKey",
  method: "get",
  path: "/config/:key",
  parameters: parametersBuilder()
    .addPath("key", z.string())
    .build(),
  response: configSchema,
});

// Create new config
export const createConfigEndpoint = makeEndpoint({
  alias: "createConfig",
  method: "post",
  path: "/config",
  parameters: parametersBuilder()
    .addBody(createConfigSchema)
    .build(),
  response: z.object({
    message: z.string(),
    data: configSchema,
  }),
});

// Update config by key
export const updateConfigEndpoint = makeEndpoint({
  alias: "updateConfig",
  method: "put",
  path: "/config/:key",
  parameters: parametersBuilder()
    .addPath("key", z.string())
    .addBody(updateConfigSchema)
    .build(),
  response: z.object({
    message: z.string(),
    data: configSchema,
  }),
});

// Delete config by key
export const deleteConfigEndpoint = makeEndpoint({
  alias: "deleteConfig",
  method: "delete",
  path: "/config/:key",
  parameters: parametersBuilder()
    .addPath("key", z.string())
    .build(),
  response: z.object({
    message: z.string(),
  }),
});

// Get configs by type
export const getConfigsByTypeEndpoint = makeEndpoint({
  alias: "getConfigsByType",
  method: "get",
  path: "/config/type/:type",
  parameters: parametersBuilder()
    .addPath("type", z.enum(["content", "version", "config"]))
    .addQueries({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(99),
    })
    .build(),
  response: z.object({
    data: z.array(configSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  }),
});

// Bulk create/update configs
export const bulkConfigEndpoint = makeEndpoint({
  alias: "bulkConfig",
  method: "post",
  path: "/config/bulk",
  parameters: parametersBuilder()
    .addBody(bulkConfigSchema)
    .build(),
  response: z.object({
    message: z.string(),
    results: z.array(z.object({
      action: z.enum(["created", "updated"]),
      data: configSchema,
    })),
  }),
});
