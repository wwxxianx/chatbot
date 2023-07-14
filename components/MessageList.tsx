import { Message } from "@prisma/client"
import MessageContent from "./MessageContent"

interface MessageListProps {
    messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
    if (!messages.length) return <p>No message yet...</p>

    return (
        <div className="pt-[100px] sm:pt-[84px] px-4 pb-11 space-y-4">
            {messages.map((message: Message) => {
                return (
                    <MessageContent key={message.id} message={message}/>
                )
            })}
        </div>
    )
}