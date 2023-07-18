import { db } from "@/lib/db";

function formatCountry(country: string) {
    return country
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get("q");

        if (!q) return new Response("Invalid query", { status: 400 });

        const results = await db.flight.findMany({
            where: {
                OR: [
                    {
                        flightNumber: {
                            equals: q,
                        },
                    },
                    {
                        departure: {
                            country: {
                                contains: q
                            },
                        },
                    },
                    {
                        destination: {
                            country: {
                                contains: q,
                            },
                        },
                    },
                ],
            },
            include: {
                departure: true,
                destination: true,
            },
        });

        if (!results || results.length === 0) {
            return new Response("Could not find relevant flight", { status: 500})
        }

        console.log('search results: ', results);

        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        return new Response("Could not find relevant flight", { status: 500})
    }
}
