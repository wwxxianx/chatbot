import { db } from "@/lib/db";
import { NewMessageValidator } from "@/lib/validators/message";
import axios from "axios";
import { z } from "zod";

const systemMessage = {
    role: "system",
    content: "Speak like a professional who knows everything.",
};

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { sessionId, message } = NewMessageValidator.parse(body);

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [systemMessage, { role: "user", content: message }],
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
        return new Response(
            "Couldn't send this message, you might exceed the usage limit of this API.",
            { status: 500 }
        );
    }
}
