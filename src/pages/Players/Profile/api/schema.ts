import { z } from "zod";

import { playersSchema } from "@/pages/Admin/Players/api/schema";

export { playersSchema };

export type PlayersPayload = z.infer<typeof playersSchema>;
