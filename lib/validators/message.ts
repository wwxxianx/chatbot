import { z } from "zod";

export const NewMessageValidator = z.object({
    sessionId: z.string(),
    message: z.string().min(1)
})

export type NewMessagePayload = z.infer<typeof NewMessageValidator>;