import { z } from "zod";

export enum ConfigType {
  CONTENT = "content",
  VERSION = "version",
  CONFIG = "config"
}

export const configSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  key: z.string(),
  value: z.string().nullable(),
  type: z.nativeEnum(ConfigType),
  description: z.string().nullable(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  deletedBy: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

export const createConfigSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().optional(),
  type: z.nativeEnum(ConfigType).default(ConfigType.CONFIG),
  description: z.string().optional(),
});

export const updateConfigSchema = z.object({
  value: z.string().optional(),
  type: z.nativeEnum(ConfigType).optional(),
  description: z.string().optional(),
});

export const bulkConfigSchema = z.object({
  configs: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().optional(),
    type: z.nativeEnum(ConfigType).default(ConfigType.CONFIG),
    description: z.string().optional(),
  })).min(1, "At least one config is required"),
});

export type Config = z.infer<typeof configSchema>;
export type CreateConfig = z.infer<typeof createConfigSchema>;
export type UpdateConfig = z.infer<typeof updateConfigSchema>;
export type BulkConfig = z.infer<typeof bulkConfigSchema>;

export interface ConfigListResponse {
  data: Config[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConfigResponse {
  data: Config;
  message?: string;
}

export interface BulkConfigResponse {
  message: string;
  results: Array<{
    action: "created" | "updated";
    data: Config;
  }>;
}
