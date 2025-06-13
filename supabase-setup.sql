-- Criação das tabelas para o projeto Cezimbra Tattoo
-- Execute este script no Editor SQL do Supabase

-- Limpar tabelas anteriores se existirem
DROP TABLE IF EXISTS public.tattoos;
DROP TABLE IF EXISTS public.categories;

-- Habilitar a extensão uuid-ossp (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de categorias de tatuagens
CREATE TABLE public.categories (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela do catálogo de tatuagens
CREATE TABLE public.tattoos (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tattoo_name TEXT NOT NULL,
  category_id bigint REFERENCES public.categories(id),
  price TEXT,
  image_url TEXT,
  location TEXT,
  size TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Políticas RLS para as tabelas

-- Habilitar RLS nas tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tattoos ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela categories
CREATE POLICY "Permitir leitura pública para categories" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para categories" 
  ON public.categories FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir update para categories" 
  ON public.categories FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir delete para categories" 
  ON public.categories FOR DELETE 
  USING (true);

-- Políticas para a tabela tattoos
CREATE POLICY "Permitir leitura pública para tattoos" 
  ON public.tattoos FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para tattoos" 
  ON public.tattoos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir update para tattoos" 
  ON public.tattoos FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir delete para tattoos" 
  ON public.tattoos FOR DELETE 
  USING (true);

-- Insira algumas categorias iniciais (opcional)
INSERT INTO public.categories (category_name) VALUES 
  ('Tribal'),
  ('Oriental'),
  ('Old School'),
  ('Realismo'),
  ('Geométrica')
ON CONFLICT (category_name) DO NOTHING;
