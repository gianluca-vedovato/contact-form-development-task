// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Form submission function")

const verifyRecaptcha = async (token: string): Promise<boolean> => {
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    body: JSON.stringify({
      secret: Deno.env.get('RECAPTCHA_SECRET_KEY'),
      response: token,
    }),
  })
  const data = await response.json()

  if (data['error-codes']) {
    throw new Error(data['error-codes'].join(', '))
  }

  return data.success
}


Deno.serve(async (req) => {
  const { firstName, lastName, email, message, recaptchaToken } = await req.json()

  const recaptchaSuccess = await verifyRecaptcha(recaptchaToken)

  if (!recaptchaSuccess) {
    return new Response(JSON.stringify({ error: 'Recaptcha verification failed' }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabase = createClient(
    Deno.env.get('VITE_SUPABASE_URL')!,
    Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY')!
  )

  await supabase.from('form_submissions').insert({ email })

  const data = {
    firstName,
    lastName,
    email,
    message,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/form-submission' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
