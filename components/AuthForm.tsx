"use client";

import { Bot } from "lucide-react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useForm, SubmitHandler } from "react-hook-form";
import { AuthFormPayload, AuthFormValidator } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import InputError from "./InputError";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import useSession from "@/hooks/useSession";
import { ExtendedSession } from "@/types/db";
import { useToast } from "./ui/use-toast";

export default function AuthForm() {
    const { toast } = useToast();
    const {setSessionId} = useSession()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormPayload>({
        resolver: zodResolver(AuthFormValidator)
    });

    const { mutate: createSession, isLoading } = useMutation({
        mutationFn: async ({ email, name}: {email: string, name: string}) => {
            const payload: AuthFormPayload = {
                name: name,
                email: email
            };

            const { data } = await axios.put('/api/session', payload);
            return data as ExtendedSession
        },
        onSuccess: (data) => {
            setSessionId(data.id);
        },
        onError: (error) => toast({ description: "Something went wrong", variant: "destructive"})
    })

    const onSubmit: SubmitHandler<AuthFormPayload> = async (formData) => createSession(formData);

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-zinc-700">Talk with GPT!</p>
                <Bot className="h-5 w-5 text-zinc-700" />
            </div>

            <p className="text-md font-semibold text-zinc-700 mt-10">
                Start a new session
            </p>
            <form 
                className="space-y-4 mt-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="space-y-1">
                    <Input placeholder="Full name" {...register("name")}/>
                    {errors.name && <InputError hint={errors.name.message}/>}
                </div>

                <div className="space-y-1">
                    <Input placeholder="Email" {...register("email")}/>
                    {errors.email && <InputError hint={errors.email.message}/>}
                </div>

                <Button isLoading={isLoading} type="submit" className="w-full">
                    Start
                </Button>
            </form>
        </div>
    );
}
