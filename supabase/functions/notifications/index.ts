// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Interface for the event data
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  date: string;
  created_at: string;
}

// Interface for user preferences
interface UserPreferences {
  user_id: string;
  preferred_categories: string[];
  preferred_city: string;
  expo_push_token: string;
}


Deno.serve(async (req) => {
  const expoPushToken = "ExponentPushToken[bWCJzyHxLZbcFlH0OiSf4i]"

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      // title: "Original Title",
      body: "And here is the body!",
      // data: { someData: "goes here" },
    }),
}).then((res) => res.json());

  return new Response(
    JSON.stringify(res),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
