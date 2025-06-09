import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";

type FavoritesContextType = {
    favorites: Set<string>;
    addFavorite: (eventId: string) => Promise<void>;
    removeFavorite: (eventId: string) => Promise<void>;
    refreshFavorites: () => Promise<void>;
    isLoading: boolean;
    error?: Error | null;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refreshFavorites = async () => {
        setIsLoading(true);
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setFavorites(new Set());
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("user_favourites")
                .select("event_id")
                .eq("user_id", user.id);

            if (error) throw error;

            const favoriteIds = new Set(
                data?.map((item) => item.event_id) || []
            );
            setFavorites(favoriteIds);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error);
            } else {
                setError(new Error("An unknown error occurred"));
            }
            console.error("Error refreshing favorites:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addFavorite = async (eventId: string) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Optimistic update
            setFavorites((prev) => new Set(prev).add(eventId));

            const { error } = await supabase
                .from("user_favourites")
                .upsert({ user_id: user.id, event_id: eventId });

            if (error) throw error;
        } catch (error) {
            console.error("Error adding favorite:", error);
            // Revert on error
            refreshFavorites();
        }
    };

    const removeFavorite = async (eventId: string) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Optimistic update
            setFavorites((prev) => {
                const updated = new Set(prev);
                updated.delete(eventId);
                return updated;
            });

            const { error } = await supabase
                .from("user_favourites")
                .delete()
                .match({ user_id: user.id, event_id: eventId });

            if (error) throw error;
        } catch (error) {
            console.error("Error removing favorite:", error);
            // Revert on error
            refreshFavorites();
        }
    };

    // Refresh favorites on mount and when auth changes
    useEffect(() => {
        refreshFavorites();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            refreshFavorites();
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                refreshFavorites,
                isLoading,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};
