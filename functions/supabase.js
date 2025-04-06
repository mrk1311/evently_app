const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ttvleputeqzzvmhuabss.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dmxlcHV0ZXF6enZtaHVhYnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTc2MzksImV4cCI6MjA1Nzk5MzYzOX0.X1URzGtqNQK6I3ootltikKRVdljcftUDTwtEsAjqVR8";

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = { supabase };
