import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, isSignup, username, email, password } = await req.json();
    
    console.log('Verify OTP request - phone:', phone, 'isSignup:', isSignup, 'email:', email);
    
    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'फोन नंबर और OTP दोनों आवश्यक हैं' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OTP from database
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phone)
      .eq('otp_code', otp)
      .eq('verified', false)
      .single();

    if (fetchError || !otpRecord) {
      console.log('OTP not found or already verified:', fetchError);
      return new Response(
        JSON.stringify({ error: 'गलत OTP या OTP समाप्त हो गया' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'OTP समाप्त हो गया, कृपया नया OTP प्राप्त करें' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists by phone (try multiple formats)
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const phoneFormats = [`+91${phone}`, phone, `91${phone}`];
    
    let existingUserByPhone = existingUsers?.users?.find(
      (u) => u.phone && phoneFormats.includes(u.phone)
    );
    
    // Also check by email if provided
    let existingUserByEmail = null;
    if (email) {
      existingUserByEmail = existingUsers?.users?.find(
        (u) => u.email === email
      );
    }
    
    // Also check for phone.local email
    const phoneLocalEmail = `${phone}@phone.local`;
    const existingUserByPhoneEmail = existingUsers?.users?.find(
      (u) => u.email === phoneLocalEmail
    );

    console.log('Existing user by phone:', existingUserByPhone?.id);
    console.log('Existing user by email:', existingUserByEmail?.id);
    console.log('Existing user by phone.local:', existingUserByPhoneEmail?.id);

    let session;
    let user;

    // Use the provided password for signup, or generate default for signin
    const defaultPassword = phone + '_secure_password_' + supabaseServiceKey?.slice(-8);

    if (isSignup) {
      // SIGNUP FLOW
      // Check if user already exists
      if (existingUserByPhone || existingUserByPhoneEmail) {
        return new Response(
          JSON.stringify({ error: 'यह फोन नंबर पहले से पंजीकृत है। कृपया साइन इन करें।' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (existingUserByEmail) {
        return new Response(
          JSON.stringify({ error: 'यह ईमेल पहले से पंजीकृत है। कृपया दूसरी ईमेल का उपयोग करें।' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create new user
      const userEmail = email || phoneLocalEmail;
      const userPassword = password || defaultPassword;
      
      console.log('Creating new user with email:', userEmail);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        phone: `+91${phone}`,
        password: userPassword,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          phone_number: phone,
          username: username || '',
          full_name: username || ''
        }
      });

      if (createError) {
        console.error('Error creating user:', createError);
        
        if (createError.message.includes('Phone number already registered') || 
            (createError as any).code === 'phone_exists') {
          return new Response(
            JSON.stringify({ error: 'यह फोन नंबर पहले से पंजीकृत है। कृपया साइन इन करें।' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (createError.message.includes('already been registered') ||
            (createError as any).code === 'email_exists') {
          return new Response(
            JSON.stringify({ error: 'यह ईमेल पहले से पंजीकृत है। कृपया दूसरी ईमेल का उपयोग करें।' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'उपयोगकर्ता बनाने में समस्या आई' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      user = newUser.user;
      
      // Update profile with additional info
      if (user && (username || email)) {
        await supabase
          .from('profiles')
          .update({ 
            full_name: username || null,
            email: email || null,
            username: username || null
          })
          .eq('id', user.id);
      }

      // Sign in the new user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

      if (signInError) {
        console.error('Sign in error for new user:', signInError);
        return new Response(
          JSON.stringify({ error: 'लॉगिन में समस्या आई' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      session = signInData.session;
      user = signInData.user;
      
    } else {
      // SIGN IN FLOW
      const existingUser = existingUserByPhone || existingUserByPhoneEmail;
      
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'यह फोन नंबर पंजीकृत नहीं है। कृपया पहले साइन अप करें।' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Signing in existing user:', existingUser.id);
      
      // For sign-in, try with the default password first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: existingUser.email || phoneLocalEmail,
        password: password || defaultPassword,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        
        // If password is provided and failed, try with default password
        if (password) {
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: existingUser.email || phoneLocalEmail,
            password: defaultPassword,
          });
          
          if (retryError) {
            return new Response(
              JSON.stringify({ error: 'गलत पासवर्ड। कृपया सही पासवर्ड दर्ज करें।' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          session = retryData.session;
          user = retryData.user;
        } else {
          return new Response(
            JSON.stringify({ error: 'लॉगिन में समस्या आई। कृपया पासवर्ड दर्ज करें।' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        session = signInData.session;
        user = signInData.user;
      }
    }

    // Delete used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone_number', phone);

    console.log('User authenticated successfully:', user?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        session,
        user
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in verify-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'कुछ गलत हो गया';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
