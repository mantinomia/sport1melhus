import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iznbxvcvrphnarpfjwer.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6bmJ4dmN2cnBobmFycGZqd2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0ODkyODAsImV4cCI6MjA1OTA2NTI4MH0.6SLK3EjjnSWpfKzXW60_ZH47hSzsB2u1w4yTNYmX_Bk'

export const supabase = createClient(supabaseUrl, supabaseKey)
