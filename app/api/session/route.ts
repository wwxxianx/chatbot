import { db } from "@/lib/db";
import { AuthFormValidator } from "@/lib/validators/auth";
import { z } from "zod";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { email, name } = AuthFormValidator.parse(body);

        const session = await db.session.create({
            data: {
                userEmail: email,
                userName: name,
                // Init new GPT greeting message 
                messages: {
                    create: [
                        {
                            role: "assistant",
                            content: "I'm GPT! How can I assist you?"
                        }
                    ]
                }
            },
            include: {
                messages: true
            }
        });        

        return new Response(JSON.stringify(session), { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Could not crerate new session", { status: 500 });
    }
}