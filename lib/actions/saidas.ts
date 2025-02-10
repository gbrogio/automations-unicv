'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function registrarSaida(formData: FormData) {  
  const cookieStore = await cookies()
  const supabase = await createClient()
  
  const nome = formData.get('nome') as string
  const ra = formData.get('ra') as string
  const motivo = formData.get('motivo') as string | null

  // Check if student already registered today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: existingRecord } = await supabase
    .from('saidas')
    .select('id')
    .eq('aluno_ra', ra)
    .gte('created_at', today.toISOString())
    .maybeSingle()

  if (existingRecord) {
    throw new Error('Você já registrou sua saída hoje!')
  }

  const { error } = await supabase
    .from('saidas')
    .insert({
      aluno_nome: nome,
      aluno_ra: ra,
      motivo: motivo || null
    })

  if (error) return "Ops... Parece que deu algum problema. Contate o suporte!"

  // Store the registration in cookies to prevent multiple registrations
  cookieStore.set(`last_exit_${ra}`, today.toISOString(), {
    maxAge: today.getTime() + 5 * 60 * 60 * 1000 // Expires in 5 hours
  })

  revalidatePath('/')
}

export async function getSaidas() {
  const supabase = await createClient()

  const { data: saidas, error } = await supabase
    .from('saidas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching saidas:', error)
    return []
  }

  return saidas
}