/*
  # Initial Schema Setup

  1. New Tables
    - `saidas`
      - `id` (uuid, primary key)
      - `aluno_nome` (text)
      - `aluno_ra` (text)
      - `horario_saida` (timestamptz)
      - `motivo` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `saidas` table
    - Add policies for:
      - Authenticated users can read all records
      - Authenticated users can insert records
*/

CREATE TABLE IF NOT EXISTS saidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_nome text NOT NULL,
  aluno_ra text NOT NULL,
  horario_saida timestamptz NOT NULL DEFAULT now(),
  motivo text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saidas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow authenticated users to read all records"
  ON saidas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert records"
  ON saidas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);