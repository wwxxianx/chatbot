import { db } from "@/lib/db";
import { NewMessageValidator } from "@/lib/validators/message";
import { Flight } from "@prisma/client";
import axios from "axios";
import { z } from "zod";

const MAXIMUM_FLIGHT_SIZE = 10

function smallChunkFlight(flights: Flight[], chunkSize: number) {
    // const result = [];
    // for (let i = 0; i < flights.length; i += chunkSize) {
    //     const chunk = flights.slice(i, i + chunkSize);
    //     const systemMessage = {
    //         role: "system",
    //         content: `Flight data: ${JSON.stringify(chunk, null, 2)}`
    //     }
    //     result.push(systemMessage)
    // }
    // return result;
    return {
        role: "system",
        content: `Flight data: ${JSON.stringify(flights.slice(0, chunkSize), null, 2)}`
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, message } = NewMessageValidator.parse(body);

        // Set up backend data for AI
        const availableFlights = await db.flight.findMany({
            include: {
                departure: true,
                destination: true,
            },
        });

        const roleMessage = {
            role: "system",
            content: `You are an AI manager of a flight booking company. You should use the flight data in this message to generate useful response to users. For example, when users ask for available flight from China to United States, you should list out all the available flights from China to United States to the users.`,
        };

        const processMessage = {
            role: "system",
            content: `You should arrange the response flight data properly in points form. Each flight data should be listed out in a separate line.`
        };

        const guidanceMessage = {
            role: "system",
            content: `When users ask you how to book a flight ticket, you should give the following guidance. 1. Finds the flights by its reference or location. 2. Click on the flight and fill up personal info. 3. Click on the confirm button. 4. Done. (Show each step in separate line so it's readable)`
        }

        const filterMessage = {
            role: "system",
            content: `When users asks for specific flights (e.g., flights departure from China), you should list out all the flights that's departured from China. You can filter it based on the country property in departure object property.`,
        };

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [
                roleMessage,
                filterMessage,
                processMessage,
                guidanceMessage,
                smallChunkFlight(availableFlights, MAXIMUM_FLIGHT_SIZE),
                { role: "user", content: message },
            ],
        };

        const { data } = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            apiRequestBody,
            {
                headers: {
                    Authorization: "Bearer " + process.env.GPT_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        await db.message.create({
            data: {
                role: "user",
                content: message,
                session: {
                    connect: {
                        id: sessionId,
                    },
                },
            },
        });

        await db.message.create({
            data: {
                role: "assistant",
                content: data.choices[0].message.content,
                session: {
                    connect: {
                        id: sessionId,
                    },
                },
            },
        });

        const latestSession = await db.session.findFirst({
            where: {
                id: sessionId,
            },
            include: {
                messages: true,
            },
        });

        return new Response(JSON.stringify(latestSession), { status: 200 });
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
