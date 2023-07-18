import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get("q");

        if (!q) return new Response("Invalid query", { status: 400 });

        const results = await db.booking.findMany({
            where: {
                OR: [
                    {
                        id: {
                            equals: q,
                        },
                    },
                    {
                        userEmail: {
                            equals: q,
                        },
                    },
                    {
                        userName: {
                            equals: q,
                        },
                    },
                ],
            },
            include: {
                flight: {
                    include: {
                        departure: true,
                        destination: true
                    }
                }
            }
        });

        if (!results || results.length === 0) {
            return new Response("Could not find relevant flight", { status: 500})
        }

        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        return new Response("Could not find this booking", { status: 500 });
    }
}
