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
    const { phone, otp } = await req.json();
    
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

    if (existingUser) {
      // User exists - create session
      console.log('Existing user found:', existingUser.id);
      
      // Generate magic link for existing user
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${phone}@phone.local`,
      });

      if (signInError) {
        console.error('Error generating magic link:', signInError);
        // Try alternative approach - update user and sign in
        const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: `${phone}@phone.local`,
        });
        
        if (tokenError) {
          console.error('Error with recovery link:', tokenError);
        }
      }

      // Create session directly
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: `${phone}@phone.local`,
        password: phone + '_secure_password_' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(-8),
      });

      if (sessionError) {
        console.error('Session error for existing user:', sessionError);
      } else {
        session = sessionData.session;
        user = sessionData.user;
      }
    }

    if (!session) {
      // Create new user with phone as email (for OTP-based auth)
      const tempPassword = phone + '_secure_password_' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(-8);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: `${phone}@phone.local`,
        phone: `+91${phone}`,
        password: tempPassword,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          phone_number: phone
        }
      });

      if (createError) {
        // User might already exist with this email
        if (createError.message.includes('already been registered')) {
          // Try to sign in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: `${phone}@phone.local`,
            password: tempPassword,
          });

          if (signInError) {
            console.error('Sign in error:', signInError);
            return new Response(
              JSON.stringify({ error: 'लॉगिन में समस्या आई' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          session = signInData.session;
          user = signInData.user;
        } else {
          console.error('Error creating user:', createError);
          return new Response(
            JSON.stringify({ error: 'उपयोगकर्ता बनाने में समस्या आई' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        user = newUser.user;
        
        // Sign in the new user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: `${phone}@phone.local`,
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
