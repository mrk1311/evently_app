import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };

        checkUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user?.id)
                .single();

            setIsAdmin(data?.is_admin);
            console.log("Admin status fetched:", data);
        };
        console.log("Checking admin status for user:", user?.id);
        console.log("Admin status:", isAdmin);

        checkAdmin();
    }, [user]);

    return { user, isAdmin };
};
