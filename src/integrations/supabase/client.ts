// Legacy import path kept for compatibility.
// The exported client talks to our Express API backed by PostgreSQL.
export {
  supabase,
  supabase as db,
  dbClient,
  forceConnectionCheck,
  getConnectionStatus,
} from "@/integrations/mongodb/client";
