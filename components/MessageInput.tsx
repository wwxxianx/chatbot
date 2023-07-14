"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/Button";
import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MESSAGE_QUERY_KEY } from "@/app/config";
import LoadingAnimation from "./LoadingAnimation";
import useSession from "@/hooks/useSession";
import { useToast } from "./ui/use-toast";

export default function MessageInput() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const {session} = useSession();
    const [input, setInput] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        sendMessage();
    };

    const { mutate: sendMessage, isLoading } = useMutation({
        mutationFn: async () => {
            const payload = {
                sessionId: session?.id,
                message: input,
            };

            const { data } = await axios.put("/api/message", payload);
            return data;
        },
        onSuccess: (data) => {
            setInput("");
            queryClient.setQueryData(
                MESSAGE_QUERY_KEY,
                data
            );
        },
        onError: (error) => toast({ description: "Something went wrong", variant: "destructive"})
    });

    return (
        <form
            className="fixed bottom-0 z-10 bg-white flex items-center w-full h-fit border-t-[1px] border-slate-200"
            onSubmit={handleSubmit}
        >
            {isLoading && <LoadingAnimation className="absolute top-[-20px] left-2"/>}
            
            <TextareaAutosize
                placeholder="Ask your question"
                className="p-3 w-[90%] focus:outline-none text-sm resize-none"
                maxRows={6}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Button
                type="submit"
                variant="subtle"
                size="sm"
                className="bg-slate-200 ml-2"
            >
                <Send className="h-5 w-5" />
            </Button>
        </form>
    );
}
