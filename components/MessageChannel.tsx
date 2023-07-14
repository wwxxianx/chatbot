"use client";

import AuthForm from "./AuthForm";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MessageList from "./MessageList";
import { ExtendedSession } from "@/types/db";
import MessageInput from "./MessageInput";
import { MESSAGE_QUERY_KEY } from "@/app/config";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/Button";
import useSession from "@/hooks/useSession";
import { useToast } from "./ui/use-toast";

export default function MessageChannel() {
    const  { toast } = useToast();
    const { session, resetSession } = useSession();

    const { data, isLoading } = useQuery({
        queryKey: MESSAGE_QUERY_KEY,
        queryFn: async () => {
            try {
                const { data } = await axios.get(`/api/session/${session?.id}`);
                return data as ExtendedSession;
            } catch (error) {
                toast({ description: "Something went wrong", variant: "destructive"})
            }
        },
        enabled: !!session?.id,
    });

    if (!session?.id) return <AuthForm />;

    return (
        <div className="relative h-full w-full">
            <div className="fixed top-0 z-10 rounded-tr-lg rounded-tl-lg w-fit sm:w-full bg-slate-200 space-y-1 py-2 px-4">
                <h2 className="font-medium ">
                    Session: <span className="text-sm ">{session.id}</span>
                </h2>
                <div className="flex gap-1 items-center">
                    <AlertCircle className="h-4 w-4 text-zinc-500" />
                    <p className="text-zinc-500 text-xs ">
                        Session will be ended after 5 minutes of inactivity
                    </p>
                </div>
            </div>

            {data?.messages && data?.messages?.length !== 0 && (
                <MessageList messages={data?.messages} />
            )}

            {session.isExpired ? (
                <div className="fixed z-20 top-[200px] flex flex-col items-center justify-center w-full bg-slate-200/50 py-4">
                    <p className="font-bold text-zinc-900">The previous session has expired.</p>
                    <Button onClick={() => resetSession()}>
                        Start new sesion
                    </Button>
                </div>
            ) : (
                <MessageInput />
            )}
        </div>
    );
}
