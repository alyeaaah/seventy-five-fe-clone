import { blogPostsItemSchema } from "@/pages/Admin/Blog/api/schema";
import { matchesListSchema } from "@/pages/Admin/CustomMatch/api/schema";
import { galleriesMediaSchema } from "@/pages/Admin/Galleries/api/schema";
import { leagueSchema } from "@/pages/Admin/MasterData/League/api/schema";
import { levelsSchema } from "@/pages/Admin/MasterData/Levels/api/schema";
import { sponsorsSchema } from "@/pages/Admin/MasterData/Sponsors/api/schema";
import { merchProductsItemSchema } from "@/pages/Admin/Merchandise/api/schema";
import { playersSchema } from "@/pages/Admin/Players/api/schema";
import { tournamentsSchema } from "@/pages/Admin/Tournaments/api/schema";
import { makeEndpoint, parametersBuilder } from "@zodios/core";
import { z } from "zod";


const featuredPlayerApi = makeEndpoint({
  alias: "getFeaturedPlayer",
  method: "get",
  path: `/public/player/featured`,
  response: z.object({
    data: z.array(playersSchema)
  })
});
const featuredBlogApi = makeEndpoint({
  alias: "getFeaturedBlog",
  method: "get",
  path: `/public/blog/featured`,
  response: z.object({
    data: z.array(blogPostsItemSchema)
  })
});
const sponsorsBySlot = makeEndpoint({
  alias: "getSponsorsBySlot",
  method: "get",
  path: `/public/sponsors`,
  parameters: parametersBuilder().addQueries
    ({
      slot: z.string().optional(),
  }).build(),
  response: z.object({
    data: z.array(sponsorsSchema)
  })
});
const levelListApi = makeEndpoint({
  alias: "getLevelList",
  method: "get",
  path: `/public/levels`,
  response: z.object({
    data: z.array(levelsSchema)
  })
});
const leagueListApi = makeEndpoint({
  alias: "getLeagueList",
  method: "get",
  path: `/public/leagues`,
  response: z.object({
    data: z.array(leagueSchema)
  })
});
export const endpoints = {
  featuredPlayerApi,
  featuredBlogApi,
  sponsorsBySlot,
  levelListApi,
  leagueListApi
};