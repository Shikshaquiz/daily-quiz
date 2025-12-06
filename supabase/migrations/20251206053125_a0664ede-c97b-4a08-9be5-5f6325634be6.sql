-- Drop restrictive policies and create permissive ones for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create PERMISSIVE policies (default is permissive)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Same for user_credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add INSERT policy for user_credits (needed for trigger)
CREATE POLICY "Users can insert their own credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);