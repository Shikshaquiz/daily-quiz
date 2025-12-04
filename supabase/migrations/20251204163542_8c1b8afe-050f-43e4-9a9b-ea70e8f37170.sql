-- Update the handle_new_user trigger to extract phone from email or metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  extracted_phone TEXT;
BEGIN
  -- Try to get phone from metadata first, then extract from email if it's a phone-based email
  extracted_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone_number',
    NEW.phone,
    CASE 
      WHEN NEW.email LIKE '%@phone.local' THEN SPLIT_PART(NEW.email, '@', 1)
      ELSE NULL
    END
  );
  
  INSERT INTO public.profiles (id, phone_number, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(extracted_phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email)
  );
  
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$function$;