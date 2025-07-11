import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  const insertFormSubmission = async (formData: Record<string, string>) => {
    const { data, error } = await supabase.functions.invoke('form-submission', {
      body: formData,
    })

    if (error) throw error
    return data
  }

  return { insertFormSubmission }
}
