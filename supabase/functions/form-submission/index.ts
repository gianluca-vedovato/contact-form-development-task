// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js'

console.log("Form submission function")

const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const formData = new URLSearchParams();
  formData.append('secret', Deno.env.get('RECAPTCHA_SECRET_KEY') || '');
  formData.append('response', token);

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  const data = await response.json();

  if (data['error-codes']) {
    throw new Error(data['error-codes'].join(', '));
  }

  return data.success;
};

const addCorsHeaders = (response: Response): Response => {
  // Allow requests from localhost or the production URL
  const isLocal = Deno.env.get("ENV") === "local"
  const origin = isLocal ? 'http://localhost:5173' : 'https://sb-form.netlify.app'

  const headers = new Headers(response.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', '*')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { status: 200 }))
    }

    const { firstName, lastName, email, message, recaptchaToken } = await req.json()

    const recaptchaSuccess = await verifyRecaptcha(recaptchaToken)

    if (!recaptchaSuccess) {
      return addCorsHeaders(new Response(JSON.stringify({ error: 'Recaptcha verification failed' }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }))
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const data = {
      first_name: firstName,
      last_name: lastName,
      email,
      message,
    }

    await supabase.from('form_submissions').insert(data)


    return addCorsHeaders(new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    }))
  } catch (error) {
    console.error('Function error:', error)
    return addCorsHeaders(new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }))
  }
})
