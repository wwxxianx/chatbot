import { z } from "zod";

export const BookingFormValidator = z.object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Invalid email format" }),
});

export const BookingRequestValidator = BookingFormValidator.extend({
    flightId: z.string()
})

export type BookingFormPayload = z.infer<typeof BookingFormValidator>;
export type BookingRequestPayload = z.infer<typeof BookingRequestValidator>
