// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jjjooxhyeasaajahqbsi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqam9veGh5ZWFzYWFqYWhxYnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjA0MTUsImV4cCI6MjA1Nzc5NjQxNX0.ts2vUPVZ4ZnYBXP5CMtLoapojU3ytiMFuv2pJajTZjw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);