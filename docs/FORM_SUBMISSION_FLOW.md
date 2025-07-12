# Form Submission Flow

## Overview

The form submission process follows a secure, multi-step validation flow to ensure a great UX and protection against spam.
![Form submission flow](/docs/form_submission_flow.jpg)

## Step-by-Step Flow

### 1. User Input and Real-time Validation

```typescript
// Real-time validation on field blur and input change
const handleBlur = (field: string) => {
  validateField(field)
}

// Validate a single field on input if there is an error
const handleInputChange = (field: string) => {
  if (!errors[field]) return
  validateField(field)
}
```

**What happens:**

- User types in form fields
- Each field validates on blur
- Fields with errors re-validate as user types to ensure error disappearing as soon as possible
- Validation errors display with red borders and a message

### 2. Form Submission Trigger

```typescript
// Form submission handler
// 1. Form validation
// 2. Recaptcha validation
// 3. Supabase submission
const handleSubmit = async () => {
  formStatus.value = 'loading'

  validateAndSubmit(async (data) => {
    try {
      const { data: recaptchaValidationData } = await executeRecaptcha()

      if (!recaptchaValidationData) {
        formStatus.value = 'error'
        return
      }

      const submissionResult = await insertFormSubmission({
        ...data,
        recaptchaToken: recaptchaValidationData.token,
      })

      if (!submissionResult.success) {
        formStatus.value = 'error'
        return
      }
      formStatus.value = 'success'
    } catch (error) {
      console.error('Form submission failed:', error)
      formStatus.value = 'error'
    }
  })
}
```

**What happens:**

- User clicks "Send Message" button
- Loading state is activated
- Form validation with Zod schema
- If validation fails, errors are displayed
- If validation passes, ReCaptcha verification starts

### 3. reCAPTCHA Verification

```typescript
const execute = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Verify reCAPTCHA is ready
    if (!isReady.value) {
      reject(new Error('reCAPTCHA not ready'))
      return
    }

    // Execute invisible reCAPTCHA
    window.grecaptcha.execute()

    // Handle success/error callbacks
    window.onCaptchaSuccess = (token: string) => {
      resolve(token)
    }

    window.onCaptchaError = () => {
      reject(new Error('reCAPTCHA verification failed'))
    }
  })
}
```

**What happens:**

- Invisible reCAPTCHA widget executes
- Google validates the user interaction
- Returns a verification token on success
- Throws error if verification fails
- If success reCAPTCHA token is added to the payload

### 54. Backend Submission

```typescript
const insertFormSubmission = async (formData: Record<string, string>) => {
  const { data, error } = await supabase.functions.invoke('form-submission', {
    body: formData,
  })

  if (error) throw error
  return data
}
```

**What happens:**

- Form data + reCAPTCHA token sent to Supabase Edge Function
- Request includes all form fields and verification token
- Supabase client handles the HTTP request

### 6. Server-side Processing

```typescript
// Edge Function receives the request
const { firstName, lastName, email, message, recaptchaToken } = await req.json()

// Verify reCAPTCHA token with Google
const recaptchaSuccess = await verifyRecaptcha(recaptchaToken)

if (!recaptchaSuccess) {
  return new Response(JSON.stringify({ error: 'Recaptcha verification failed' }), {
    status: 400,
  })
}

// Insert data into database
const data = {
  first_name: firstName,
  last_name: lastName,
  email,
  message,
}

await supabase.from('form_submissions').insert(data)
```

**What happens:**

- Edge Function receives the form data
- reCAPTCHA token is verified with Google's API
- If verification fails, error is returned
- If verification succeeds, data is inserted into Supabase db
- Success response is sent back to frontend

### 7. Frontend Response Handling

```typescript
// Success case
if (result.success) {
  formStatus.value = 'success'
} else {
  formStatus.value = 'error'
}

// Auto-hide messages after 6 seconds
watch(formStatus, (newStatus) => {
  if (newStatus === 'success' || newStatus === 'error') {
    setTimeout(() => {
      formStatus.value = 'idle'
    }, 6000)
  }
})
```

**What happens:**

- Frontend receives response from Edge Function
- Success/error state is set accordingly
- User sees appropriate feedback message
- Form is cleared on success
- Messages auto-hide after 3 seconds
