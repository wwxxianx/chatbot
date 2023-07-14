import { MessagesSquare } from "lucide-react";
import { Button } from "./ui/Button";

export default function ChatButton() {
    return (
        <Button variant="outline" className="gap-2 text-slate-700">
            <MessagesSquare className="text-slate-700" />
            Chat with AI
        </Button>
    );
}
