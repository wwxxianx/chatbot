"use client";

import { SESSION_QUERY_KEY, SESSION_TIMEOUT, sessionKey } from "@/app/config";
import { ExtendedSession } from "@/types/db";
import { useSessionStorage } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

type TimeoutSession =
    | (ExtendedSession & {
          isExpired: boolean | null;
      })
    | null;

export default function useSession() {
    const queryClient = useQueryClient();
    const [sessionId, setSessionId] = useSessionStorage(sessionKey);
    const [session, setSession] = useState<TimeoutSession | any>();

    const currentDatetime = new Date();
    const fiveMinutesAgo = new Date(
        currentDatetime.getTime() - SESSION_TIMEOUT * 60 * 1000
    );

    const { data } = useQuery({
        queryKey: SESSION_QUERY_KEY,
        queryFn: async () => {
            try {
                const { data } = await axios.get(`/api/session/${sessionId}`);
                return data as ExtendedSession;
            } catch (error) {
                console.log("error fetching session");
            }
        },
        enabled: !!sessionId,
        onSuccess: (data) => {
            const updatedAt = new Date(data?.updatedAt!);
            setSession({ ...data, isExpired: updatedAt < fiveMinutesAgo });
        },
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (sessionId) {
                // Trigger a refetch to update the session data
                // Every 5 seconds
                queryClient.invalidateQueries(SESSION_QUERY_KEY);
            }
        }, 5 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [sessionId, queryClient]);

    const resetSession = () => {
        setSessionId((current) => "");
        setSession(null);
    };

    return { session, setSession, resetSession, setSessionId };
}
