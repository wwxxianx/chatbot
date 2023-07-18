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
import { ExtendedBooking } from "@/types/db";
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
import { toast } from "./ui/use-toast";

export default function SearchBooking() {
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
            console.log('searching')
            const { data } = await axios.get(`/api/booking/search?q=${input}`);
            console.log("search results: ", data);
            return data as ExtendedBooking[];
        },
        queryKey: ["search-booking"],
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
                    placeholder="Search your bookings by (referece number / email / full name)..."
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
                    {queryResults?.map((booking) => {
                        return (
                            <div>
                                <BookingDialog booking={booking} />
                                <DeleteBookingDialog booking={booking}/>
                            </div>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function DeleteBookingDialog({ booking }: { booking: ExtendedBooking }) {

    const { mutate: handleDeleteBooking } = useMutation({
        mutationFn: async () => {
            const { data } = await axios.delete(`/api/booking/${booking.id}`);
        },
        onSuccess: (data) =>
            toast({
                title: "Flight ticket cancelled",
                description: `Your flight ticket ${booking.id} has been cancelled`,
            }),
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-red-500 ml-6 mb-6" variant="destructive">
                    Cancel flight
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600">
                        Cancel flight?
                    </DialogTitle>
                    <DialogDescription className="text-red-800">
                        By doing so, your flight ticket will be cancelled and
                        become invalid permanently.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={() => handleDeleteBooking()}
                        className="bg-red-500"
                        variant="destructive"
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BookingDialog({ booking }: { booking: ExtendedBooking }) {
    const departureDateTime =
        typeof booking.flight.departureDateTime === "string"
            ? parseISO(booking.flight.departureDateTime)
            : booking.flight.departureDateTime;
    const arrivalDateTime =
        typeof booking.flight.arrivalDateTime === "string"
            ? parseISO(booking.flight.arrivalDateTime)
            : booking.flight.arrivalDateTime;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <li className="px-6 py-4 cursor-pointer">
                    <p>
                        <span className="text-zinc-500">
                            Booking Reference:{" "}
                        </span>
                        {booking.id}
                    </p>
                    <p>
                        <span className="text-zinc-500">Passenger: </span>
                        {booking.userName}
                    </p>
                    <div className="flex justify-between">
                        <div className="flex gap-2 text-sm text-zinc-500">
                            <PlaneTakeoff className="h-4 w-4 text-zinc-500" />
                            <p>
                                Departure:{" "}
                                <span className="text-zinc-700">
                                    {booking.flight.departure.country}
                                </span>{" "}
                                (
                                {format(departureDateTime, "MMMM-d-yyyy hh:mm")}
                                )
                            </p>
                        </div>
                        <p className="text-xs text-zinc-500">
                            {booking.flight.flightNumber}
                        </p>
                    </div>
                    <div className="flex gap-2 text-sm text-zinc-500">
                        <PlaneLanding className="h-4 w-4 text-zinc-500" />
                        <p>
                            Destination:{" "}
                            <span className="text-zinc-700">
                                {booking.flight.destination.country}
                            </span>{" "}
                            ({format(arrivalDateTime, "MMMM-d-yyyy hh:mm")})
                        </p>
                    </div>
                    <p className="flex gap-2 items-center text-sm text-zinc-700">
                        {booking.flight.departure.airport}{" "}
                        <Plane className="h-4 w-4" />{" "}
                        {booking.flight.destination.airport}
                    </p>
                </li>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Your flight ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-sm text-zinc-800">
                            Flight Number: {booking.flight.flightNumber}
                        </h2>
                        <p className="flex gap-2 items-center text-sm text-zinc-800">
                            {booking.flight.departure.airport}{" "}
                            <Plane className="h-4 w-4" />{" "}
                            {booking.flight.destination.airport}
                        </p>
                        <div className="flex gap-2 text-sm text-zinc-500">
                            <PlaneTakeoff className="h-4 w-4 text-zinc-500" />
                            <p>
                                Departure:{" "}
                                <span className="text-zinc-700">
                                    {booking.flight.departure.country}
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
                                    {booking.flight.destination.country}
                                </span>{" "}
                                ({format(arrivalDateTime, "MMMM-d-yyyy hh:mm")})
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
