import { Message, Session } from "@prisma/client";

export type ExtendedSession = Session & {
    messages: Message[]
}

export const defaultSession: ExtendedSession = {
    messages: [],
    id: "",
    userName: "",
    userEmail: ""
}