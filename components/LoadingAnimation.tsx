import { cn } from "@/lib/utils";

export default function LoadingAnimation({ className = "" }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-1 fixed", className)}>
            <div className="h-2 w-2 rounded-full bg-slate-300 aniamte-pulse animate-bounce"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 aniamte-pulse animate-bounce delay-100"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 aniamte-pulse animate-bounce delay-200"></div>
            <p className="text-xs text-slate-500">Processing</p>
        </div>
    );
}
