import { devLog, devError } from '@/utils/dev-log'
import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  const insertFormSubmission = async (formData: Record<string, string>) => {
    devLog('Inserting form submission', 'useSupabase.ts')
    const { data, error } = await supabase.functions.invoke('form-submission', {
      body: formData,
    })

    if (error) {
      devError(`Error inserting form submission: ${JSON.stringify(error)}`, 'useSupabase.ts')
      throw error
    }

    devLog('Form submission inserted', 'useSupabase.ts')
    return { success: true, data }
  }

  return { insertFormSubmission }
}
