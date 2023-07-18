import { db } from "@/lib/db";

function getRandomDate() {
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();
    const randomTimestamp =
        currentTimestamp + Math.floor(Math.random() * 86400000); // 86400000 milliseconds = 1 day
    const randomDate = new Date(randomTimestamp);

    return randomDate;
}

function generateLargerDate(date: Date) {
    const currentTimestamp = date.getTime();
    const randomTimestamp =
        currentTimestamp + Math.floor(Math.random() * 86400000); // 86400000 milliseconds = 1 day
    const randomDate = new Date(randomTimestamp);

    return randomDate;
}

function calculateDuration(startDate: Date, endDate: Date) {
    const duration = Math.abs(endDate.getTime() - startDate.getTime()) / 1000; // Convert to seconds

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    const formattedDuration = `${hours} hours ${minutes} minutes`;
    return formattedDuration;
}

function getRandomAirline() {
    const randomLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomPrefix = "";

    // Generate a random prefix of 3 uppercase letters
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * randomLetters.length);
        randomPrefix += randomLetters[randomIndex];
    }

    const airlineName = randomPrefix + " Airlines";
    return airlineName;
}

export async function POST(req: Request) {
    try {
        const departureAt = getRandomDate();
        const arrivalAt = generateLargerDate(departureAt);
        const duration = calculateDuration(departureAt, arrivalAt);

        // const data = await db.location.create({
        //     data: {
        //         airport: "Changi Airport",
        //         country: "Singapore",
        //         iataCode: "SIN",
        //     },
        // });

        const data = await db.flight.create({
            data: {
                departure: {
                    connect: {
                        id: "64b5550b02c11bad571e7561",
                    },
                },
                destination: {
                    connect: {
                        id: "64b5553202c11bad571e7564",
                    },
                },
                airline: getRandomAirline(),
                arrivalDateTime: arrivalAt,
                departureDateTime: departureAt,
                duration: duration,
                seatAvailability: 120,
            },
        });

        return new Response(JSON.stringify(data), { status: 201 });
    } catch (error) {}
}

export async function GET(req: Request) {
    try {
        const data = await db.location.findMany();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {}
}
