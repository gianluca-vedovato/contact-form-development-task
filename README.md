# 📋 Overview

This project showcases my approach to developing a basic contact form that submits data to a serverless function.
Since I was free to choose the tech stack I preferred, I decided to move forward with Vue.js for the frontend and Supabase as the database for data collection.

# 🚀 Live demo

The form is available at [https://sb-form.netlify.app/](https://sb-form.netlify.app/)

# 🏁 Getting Started

## Project Setup

- Copy the `.env.local.example` content in `.env.local` file and add environment variables.
- Install dependencies

```bash
npm install
```

- Copy `/supabase/functions/.env.example` content in `/supabase/functions/.env` file and add environment variables.

## Compile and Hot-Reload for Frontend Development

```bash
npm run dev
```

## Start Supabase

```bash
supabase start
supabase serve function form-submission
```

> ⚠️ Ensure to have Docker installed to run Supabase locally

## Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

## Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# 🛠️ Technical Stack

In this section, I'll dive deeper into the tech stack, explaining how the project works and the reasoning behind my choices.
To read more about the form submission flow, a [dedicated documentation](/docs/FORM_SUBMISSION_FLOW.md) is provided

- **Frontend**: Vue.js 3 with TypeScript
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL
- **Validation**: Zod schema validation
- **Security**: Google reCAPTCHA
- **Testing**: Vitest for unit tests, Playwright for E2E

## Frontend

Since the frontend consists of just a form, I decided to use Vue.js, as I’m comfortable with it for form handling.
This is mainly due to the use of the `v-model` directive, which allows easy control of input values from outside the component. Combined with full control over attribute inheritance, it provides a powerful way to handle input components and clearly separate logic from the UI.

My components [InputField](https://github.com/gianluca-vedovato/form/blob/main/src/components/InputText.vue) and [TextArea](https://github.com/gianluca-vedovato/form/blob/main/src/components/TextArea.vue) are responsible for displaying the UI and handling different states, while the [ContactForm](https://github.com/gianluca-vedovato/form/blob/main/src/components/ContactForm.vue) manages the overall form state and controls the UI from a higher, centralized level.

### Design changes and additions

I had to make some small changes to the initial design provided.
Since I used reCAPTCHA to validate the form, I added a disclaimer at the bottom of the form.
To display validation errors, I added a red border to the input fields with errors.
I also included a text block between the privacy disclaimer and the submit button to show a success or error message after submission. This message will automatically disappear after 3 seconds.
Other Visual Feedback as mouse hover states or focus states are provided.

### Composables

Even though the simplicity of the project didn’t require it, I chose to use [composables functions](https://github.com/gianluca-vedovato/form/tree/main/src/composables) to encapsulate and reuse stateful logic, preparing the codebase for potential future scaling and avoiding logic repetition.
For this project, I created three composable functions:

#### Form validation

A useful function designed for use in forms throughout the project. It takes a Zod schema as input and returns:

- `formData`: Reactive object with current inputs state
- `errors`: Reactive object with input ids as keys and error messages as values
- `messageSent`: Boolean to know wether a form submission is complete
- `clearForm`: Function to reset all form fields
- `validateField`: Function to validate a single field. It updates the errors object
- `validateForm`: Function to validate the entire form
- `handleSubmit`: Function to handle the submit event. It launches `validateForm` function, if form is valid it runs `onSuccess` callback

#### Recaptcha

This composable receives the reCAPTCHA key and the ID of the rendered element as input, and handles the reCAPTCHA validation.
In short, it first runs the render function for reCAPTCHA, then exposes an execute method to trigger the reCAPTCHA validation, throwing an error if the validation fails.

#### Supabase

A simple composable to centralize Supabase logic. For this project, it only handles the Supabase client setup and the call to the `form-submission` function.

### Style

For styling I used SCSS combined with CSS Module. I defined all my theme variables in [\_variable.scss](https://github.com/gianluca-vedovato/form/blob/main/src/assets/styles/_variables.scss), then in [global.scss](https://github.com/gianluca-vedovato/form/blob/main/src/assets/styles/global.scss) I defined CSS variables based on SCSS ones to easily debug in browser devtools, allow usage in `calc()` functions, and provide access via JavaScript—while still keeping the SCSS variables for cases where I need SCSS utilities.

### Tests

I used Vitest for unit tests. I tested most impactful components: ContactForm, InputText, TextArea and PrimaryButton.
I also added few E2E tests covering main features.

## Backend

For the backend, I decided to use Supabase since I am familiar with it.
I created an edge function that first validates the reCAPTCHA using the token provided in the environment variables, then collects the data from the request body and inserts it as a row in the `form_submissions` Supabase table protected with simople RLS policy.

# 🔮 Future improvements

- Visual regression testing
- Code coverage
- Error monitoring (Sentry)
- CI/CD for testing
- Avoid layout shifts in form error messages
- Advanced spam detection
- Input sanitization improvements
- CSRF protection
- Optimistic UI updates
