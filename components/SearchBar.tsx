"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { format } from "date-fns";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
} from "@/components/ui/Command";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import debounce from "lodash.debounce";
import { ExtendedFlight } from "@/types/db";
import { Button } from "./ui/Button";
import { Plane, PlaneLanding, PlaneTakeoff } from "lucide-react";
import { parseISO } from "date-fns";
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "./ui/Dialog";
import { Input } from "./ui/Input";
import {
    BookingFormPayload,
    BookingFormValidator,
    BookingRequestPayload,
} from "@/lib/validators/booking";
import { toast } from "./ui/use-toast";
import { Booking } from "@prisma/client";

export default function SearchBar() {
    const [input, setInput] = useState("");
    const commandRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(commandRef, () => {
        setInput("");
    });

    const request = debounce(async () => {
        refetch();
    }, 300);

    const debounceRequest = useCallback(() => {
        request();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        isFetching,
        data: queryResults,
        refetch,
        isFetched,
    } = useQuery({
        queryFn: async () => {
            if (!input) return [];
            const { data } = await axios.get(`/api/flight/search?q=${input}`);
            console.log("search results: ", data);
            return data as ExtendedFlight[];
        },
        queryKey: ["search-flight"],
        enabled: input.length > 0,
        onSuccess: (data) => {
            console.log("data on onSuccess: ", data);
        },
        onError: (error) => console.log("error: ", error),
    });

    return (
        <div>
            <Command
                ref={commandRef}
                className="relative rounded-lg border max-w-lg z-50 overflow-visible mx-auto mt-10"
            >
                <CommandInput
                    isLoading={isFetching}
                    onValueChange={(text) => {
                        setInput(text);
                        debounceRequest();
                    }}
                    value={input}
                    className="ring-0"
                    placeholder="Search flights..."
                />

                {input.length > 0 && (
                    <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
                        {isFetched && queryResults?.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}
                    </CommandList>
                )}
            </Command>

            {(queryResults?.length ?? 0) > 0 && (
                <ul className="bg-white max-w-xl mx-auto shadow-xl rounded-lg divide-y-[1px] ">
                    {queryResults?.map((flight) => {
                        return <FlightDialog key={flight.id} flight={flight} />;
                    })}
                </ul>
            )}
        </div>
    );
}

function FlightDialog({ flight }: { flight: ExtendedFlight }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookingFormPayload>({
        resolver: zodResolver(BookingFormValidator),
    });

    const { mutate: bookFlight, isLoading } = useMutation({
        mutationFn: async (formData: BookingFormPayload) => {
            const payload: BookingRequestPayload = {
                email: formData.email,
                fullName: formData.fullName,
                flightId: flight.id,
            };

            const { data }: { data: Booking } = await axios.post("/api/booking", payload);

            toast({
                title: "Your flight ticket",
                description: `Flight ticket reference: ${data.id}`
            })
        },
        
    });

    const onSubmit: SubmitHandler<BookingFormPayload> = async (data) => {
        await bookFlight(data)
    };

    const departureDateTime =
        typeof flight.departureDateTime === "string"
            ? parseISO(flight.departureDateTime)
            : flight.departureDateTime;
    const arrivalDateTime =
        typeof flight.arrivalDateTime === "string"
            ? parseISO(flight.arrivalDateTime)
            : flight.arrivalDateTime;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <li className="px-6 py-4 cursor-pointer">
                    <div className="flex justify-between">
                        <div className="flex gap-2 text-sm text-zinc-500">
                            <PlaneTakeoff className="h-4 w-4 text-zinc-500" />
                            <p>
                                Departure:{" "}
                                <span className="text-zinc-700">
                                    {flight.departure.country}
                                </span>{" "}
                                (
                                {format(departureDateTime, "MMMM-d-yyyy hh:mm")}
                                )
                            </p>
                        </div>
                        <p className="text-xs text-zinc-500">
                            {flight.flightNumber}
                        </p>
                    </div>
                    <div className="flex gap-2 text-sm text-zinc-500">
                        <PlaneLanding className="h-4 w-4 text-zinc-500" />
                        <p>
                            Destination:{" "}
                            <span className="text-zinc-700">
                                {flight.destination.country}
                            </span>{" "}
                            ({format(arrivalDateTime, "MMMM-d-yyyy hh:mm")})
                        </p>
                    </div>
                    <p className="flex gap-2 items-center text-sm text-zinc-700">
                        {flight.departure.airport} <Plane className="h-4 w-4" />{" "}
                        {flight.destination.airport}
                    </p>
                </li>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Book your flight ticker</DialogTitle>
                    <DialogDescription>
                        Enter your personal information and click confirm button
                        to place your booking.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-sm text-zinc-800">
                            Flight Number: {flight.flightNumber}
                        </h2>
                        <p className="flex gap-2 items-center text-sm text-zinc-800">
                            {flight.departure.airport}{" "}
                            <Plane className="h-4 w-4" />{" "}
                            {flight.destination.airport}
                        </p>
                        <div className="flex gap-2 text-sm text-zinc-500">
                            <PlaneTakeoff className="h-4 w-4 text-zinc-500" />
                            <p>
                                Departure:{" "}
                                <span className="text-zinc-700">
                                    {flight.departure.country}
                                </span>{" "}
                                (
                                {format(departureDateTime, "MMMM-d-yyyy hh:mm")}
                                )
                            </p>
                        </div>
                        <div className="flex gap-2 text-sm text-zinc-500">
                            <PlaneLanding className="h-4 w-4 text-zinc-500" />
                            <p>
                                Destination:{" "}
                                <span className="text-zinc-700">
                                    {flight.destination.country}
                                </span>{" "}
                                ({format(arrivalDateTime, "MMMM-d-yyyy hh:mm")})
                            </p>
                        </div>
                    </div>
                    <form
                        id="bookingForm"
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <Input
                            placeholder="Your full name"
                            {...register("fullName")}
                        />
                        <Input
                            placeholder="Contact email"
                            {...register("email")}
                        />
                    </form>
                </div>
                <DialogFooter>
                    <Button isLoading={isLoading} type="submit" form="bookingForm">
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
