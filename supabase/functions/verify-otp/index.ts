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
    
    console.log('Verify OTP request - phone:', phone, 'isSignup:', isSignup);
    
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

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.phone === `+91${phone}`
    );

    let session;
    let user;

    // Determine email and password to use
    const userEmail = isSignup && email ? email : `${phone}@phone.local`;
    const tempPassword = isSignup && password 
      ? password 
      : phone + '_secure_password_' + supabaseServiceKey?.slice(-8);

    if (existingUser) {
      // User exists - sign in
      console.log('Existing user found:', existingUser.id);
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: existingUser.email || `${phone}@phone.local`,
        password: tempPassword,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        // User exists but password doesn't match - this is for existing users
        return new Response(
          JSON.stringify({ error: 'यह नंबर पहले से पंजीकृत है। कृपया सही पासवर्ड का उपयोग करें।' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      session = signInData.session;
      user = signInData.user;
    } else {
      // Create new user
      console.log('Creating new user with email:', userEmail);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        phone: `+91${phone}`,
        password: tempPassword,
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
        
        if (createError.message.includes('already been registered')) {
          return new Response(
            JSON.stringify({ error: 'यह ईमेल पहले से पंजीकृत है' }),
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
        password: tempPassword,
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