import { AlertTriangle } from "lucide-react";

export default function InputError({ hint }: { hint?: string}) {
    return (
        <div className="font-medium text-red-400 text-xs flex items-center gap-1">
            <AlertTriangle className="h-3 w-3"/>
            <p>{hint}</p>
        </div>
    )
}