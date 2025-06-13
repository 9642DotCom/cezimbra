-- Criação das tabelas para o "catalogo cezimbra"
-- Execute este script no Editor SQL do Supabase

-- Tabela de categorias do catálogo
CREATE TABLE public.catalogo_categorias (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela de itens do catálogo
CREATE TABLE public.catalogo_itens (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  categoria_id bigint REFERENCES public.catalogo_categorias(id),
  preco NUMERIC(10,2),
  preco_promocional NUMERIC(10,2),
  imagem TEXT,
  disponivel BOOLEAN DEFAULT TRUE,
  descricao TEXT,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.catalogo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogo_itens ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela catalogo_categorias
CREATE POLICY "Permitir leitura pública para catalogo_categorias" 
  ON public.catalogo_categorias FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para catalogo_categorias" 
  ON public.catalogo_categorias FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir update para catalogo_categorias" 
  ON public.catalogo_categorias FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir delete para catalogo_categorias" 
  ON public.catalogo_categorias FOR DELETE 
  USING (true);

-- Políticas para a tabela catalogo_itens
CREATE POLICY "Permitir leitura pública para catalogo_itens" 
  ON public.catalogo_itens FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para catalogo_itens" 
  ON public.catalogo_itens FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir update para catalogo_itens" 
  ON public.catalogo_itens FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir delete para catalogo_itens" 
  ON public.catalogo_itens FOR DELETE 
  USING (true);

-- Inserir algumas categorias iniciais
INSERT INTO public.catalogo_categorias (nome, descricao) VALUES 
  ('Tatuagens', 'Designs de tatuagens disponíveis'),
  ('Piercings', 'Piercings e joias disponíveis'),
  ('Produtos', 'Produtos para cuidados e acessórios'),
  ('Promoções', 'Itens com preços promocionais')
ON CONFLICT (nome) DO NOTHING;
