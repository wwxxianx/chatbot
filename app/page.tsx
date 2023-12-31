"use client";

import MessageChannel from "@/components/MessageChannel";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/Button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/Popover";
import useSession from "@/hooks/useSession";
import { db } from "@/lib/db";
import axios from "axios";
import { MessagesSquare, MoveDownRight } from "lucide-react";


export default function Home() {
    const { session, resetSession } = useSession();

    async function createFlight() {
        try {
            const { data } = await axios.post("/api/flight");

            // const data = await db.flight.create({
            //     data: {
            //         airline: "ABC Airlines",
            //         arrivalDateTime: departureAt,
            //         departureDateTime: arrivalAt,
            //         duration: "8h 30m",
            //         seatAvailability: 180,
                                       
            //     }
            // })
            
            console.log('created: ', data);
            
        } catch (error) {
            
        }
    }

    return (
        <main className="relative min-h-screen">
            <div className="mt-[100px] md:mt-[200px]">
                <h1 className="text-zinc-800 font-bold text-3xl text-center">
                    Happy Chat with GPT AI
                </h1>
                
                <div className="flex justify-center items-center gap-2 mt-4">
                    <p>Try out here</p>
                    <MoveDownRight />
                </div>
            </div>
            
            <SearchBar />

            <div className="fixed bottom-[70px] right-[50px] md:top-auto md:bottom-[100px] sm:right-[150px]">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="gap-2 text-slate-700"
                        >
                            <MessagesSquare className="text-slate-700" />
                            Chat with AI
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="top"
                        align="end"
                        className="p-0 h-[450px] w-[300px] sm:w-[500px] overflow-y-scroll ml-5 sm:ml-0"
                    >
                        <MessageChannel 
                            sessionId={session?.id} 
                            sessionIsExpired={session?.isExpired}
                            resetSession={resetSession}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </main>
    );
}
