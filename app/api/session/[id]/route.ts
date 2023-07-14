import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const sessionId = params.id;

        const sessionMessages = await db.session.findFirst({
            where: {
                id: sessionId
            },
            include: {
                messages: true
            }
        });

        return new Response(JSON.stringify(sessionMessages), { status: 200 });
    } catch (error) {
        return new Response("Something went wrong", { status: 500 });
    }
}
