import { Message } from "@prisma/client";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MessageContentProps {
    message: Pick<Message, "content" | "role">;
}

export default function MessageContent({ message }: MessageContentProps) {

    return (
        <div className={cn("flex items-center gap-2", `${message.role === "user" && 'ml-auto flex-row-reverse'}`)}>
            {message.role === "assistant" ? (
                <Image
                    src="/gpt-logo.png"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="self-start w-[40px] h-[40px] rounded-full object-cover shadow-sm translate-y-[-16px]"
                />
            ) : (
                <Image
                    src="/avatar.png"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="self-start w-[40px] h-[40px] rounded-full object-cover shadow-sm translate-y-[-16px]"
                />
            )}
            <p className={`text-sm sm:text-md max-w-[170px] sm:max-w-[300px] p-4 border-[1.5px] border-slate-300 rounded-xl ${message.role === "user" ? "rounded-tr-none" : "rounded-tl-none"}`}>
                {message.content}
            </p>
        </div>
    );
}
