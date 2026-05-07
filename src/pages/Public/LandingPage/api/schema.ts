import z from "zod";

export const CarouselTypeEnum = {
  COMPONENT: "COMPONENT" as const,
  FIGURE: "FIGURE" as const,
  TEXTFIGURE: "TEXTFIGURE" as const,
} as const;

const carouselTypeEnum = z.enum(Object.values(CarouselTypeEnum) as [string, ...string[]])
export const carouselSchema = z.object({
  type: carouselTypeEnum,
  title: z.string(),
  subtitle: z.string().nullish(),
  figure_url: z.string().nullish(),
  figure: z.any().nullish(),
  target_url: z.string().nullish(),
  target_url_external: z.string().nullish(),
  cta: z.object({
    label: z.string(),
    variant: z.string(),
    size: z.string(),
    color: z.string(),
    target_url: z.string().nullish(),
    target_url_external: z.string().nullish(),
  }).nullish()
})
export type CarouselSchema = z.infer<typeof carouselSchema>;
