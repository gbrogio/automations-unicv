'use server';
import { supabase } from '@/services/supabase';

interface Student {
	full_name: string;
	ra: string;
}

export async function saveStudents(student: Student): Promise<[boolean, string]> {
  const db = supabase();
  const today = new Date().toLocaleDateString('pt-BR');

  const { data: existingStudents, error } = await db
    .from('faltas')
    .select('students')
    .eq('id', today);

  console.log(error)

  if (error) return [true, "Chama o Brogio pq deu ruim!"];

  const students = existingStudents[0].students.some((s: Student) => s.ra.slice(0, 6) === student.ra.slice(0, 6))
    ? existingStudents[0].students
    : [...existingStudents[0].students, student];

  const { data, error: error2 } = await db
    .from('faltas')
    .upsert({ id: today, students });

  if (error2) return [true, "Chama o Brogio pq a merda foi feita!"];
  return [false, "Que milagre, deu certo!"];
}