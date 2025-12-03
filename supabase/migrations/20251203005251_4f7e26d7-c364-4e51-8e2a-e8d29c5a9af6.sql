-- Drop the insecure policy that allows public access
DROP POLICY IF EXISTS "Service role can manage OTPs" ON public.otp_codes;

-- Create proper restrictive policies
-- Only authenticated service role (edge functions) should manage OTPs
-- No direct public access should be allowed

-- Policy: No public SELECT access (edge functions use service role which bypasses RLS)
CREATE POLICY "No public read access to OTPs"
ON public.otp_codes
FOR SELECT
TO authenticated
USING (false);

-- Policy: No public INSERT access
CREATE POLICY "No public insert access to OTPs"
ON public.otp_codes
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Policy: No public UPDATE access
CREATE POLICY "No public update access to OTPs"
ON public.otp_codes
FOR UPDATE
TO authenticated
USING (false);

-- Policy: No public DELETE access
CREATE POLICY "No public delete access to OTPs"
ON public.otp_codes
FOR DELETE
TO authenticated
USING (false);