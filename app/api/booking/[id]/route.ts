import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        await db.booking.delete({
            where: {
                id,
            },
        })

        return new Response("OK", { status: 200 });
    } catch (error) {
        return new Response("Could not delete booking.", { status :500 });
    }
}
