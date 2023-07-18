import { db } from "@/lib/db";
import { BookingRequestValidator } from "@/lib/validators/booking";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email, fullName, flightId } =
            BookingRequestValidator.parse(body);

        const booking = await db.booking.create({
            data: {
                userEmail: email,
                userName: fullName,
                flight: {
                    connect: {
                        id: flightId,
                    },
                },
            },
        });

        return new Response(JSON.stringify(booking), { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Unformatted request, please try again.", {
                status: 422,
            });
        }
        console.log(error);
        return new Response(
            "Couldn't send this message, you might exceed the usage limit of this API.",
            { status: 500 }
        );
    }
}
