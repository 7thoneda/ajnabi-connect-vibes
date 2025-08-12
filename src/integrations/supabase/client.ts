import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sehsfcoqkyuvdpugsfrl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHNmY29xa3l1dmRwdWdzZnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1Nzc4NDcsImV4cCI6MjA3MDE1Mzg0N30.trJwUOQcnxXSqM5gVv4f_jmVLwjQ8CBSACqs3QTA4Fw'

export const supabase = createClient(supabaseUrl, supabaseKey)