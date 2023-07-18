import { Flight, Message, Session, Location, Booking } from "@prisma/client";

export type ExtendedSession = Session & {
    messages: Message[]
}

export type ExtendedFlight = Flight & {
    departure: Location,
    destination: Location
}

export type ExtendedBooking = Booking & {
    flight: ExtendedFlight
}

export const defaultSession: ExtendedSession = {
    messages: [],
    id: "",
    userName: "",
    userEmail: ""
}