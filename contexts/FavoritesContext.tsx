// contexts/FavoritesContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { User } from "@supabase/supabase-js";
// import FavoritesContext from "../contexts/FavoritesContext";

type FavoritesContextType = {
    favorites: Set<string>;
    refreshFavorites: (user: User | null) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: new Set(),
    refreshFavorites: async () => {},
});

export const FavoritesProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const refreshFavorites = async (user: User | null) => {
        if (!user) {
            setFavorites(new Set());
            return;
        }

        const { data } = await supabase
            .from("user_favourites")
            .select("event_id")
            .eq("user_id", user.id);

        setFavorites(new Set(data?.map((item) => item.event_id) || []));
    };

    return (
        <FavoritesContext.Provider value={{ favorites, refreshFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
