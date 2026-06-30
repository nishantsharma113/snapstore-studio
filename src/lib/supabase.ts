import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verify if environment credentials are valid
const isValid =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== "" &&
  supabaseAnonKey !== "" &&
  !supabaseUrl.includes("YOUR_SUPABASE_") &&
  !supabaseAnonKey.includes("YOUR_SUPABASE_")

export const isSimulatedMode = !isValid

export const supabase = !isSimulatedMode ? createClient(supabaseUrl!, supabaseAnonKey!) : null

if (isSimulatedMode && typeof window !== "undefined") {
  console.log(
    "%c[SnapStore Studio] Running in Supabase Simulated Mode. User sessions are persisted locally.",
    "color: #a855f7; font-weight: bold; font-size: 12px; padding: 4px; border: 1px solid #a855f7; border-radius: 4px;"
  )
}
