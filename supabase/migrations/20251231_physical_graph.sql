-- 1. Tabela de Habilidades (Skills)
-- Armazena o metadado da habilidade (título, autor, dificuldade)
create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid default auth.uid(), -- Vincula ao usuário logado
  title text not null,
  category text,
  difficulty_level int check (difficulty_level between 1 and 5),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Tabela de Frames (Skill Frames)
-- Armazena os dados brutos de movimento (JSON) para cada frame do vídeo
create table if not exists skill_frames (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references skills(id) on delete cascade,
  frame_index int not null,
  landmarks jsonb not null, -- Dados do MediaPipe (x, y, z)
  tool_position jsonb, -- Dados adicionais (ex: bounding box da ferramenta)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índices e Políticas de Segurança (Row Level Security - RLS)

-- Habilitar RLS
alter table skills enable row level security;
alter table skill_frames enable row level security;

-- Index para performance na reprodução
create index if not exists idx_skill_frames_skill_id on skill_frames(skill_id);
create index if not exists idx_skill_frames_order on skill_frames(skill_id, frame_index);

-- Políticas (Simplificadas para MVP)
-- Todo mundo pode ler (para reproduzir)
create policy "Skills are public" on skills for select using (true);
create policy "Frames are public" on skill_frames for select using (true);

-- Apenas autenticados podem criar
create policy "Users can create skills" on skills for insert with check (auth.role() = 'authenticated');
create policy "Users can create frames" on skill_frames for insert with check (auth.role() = 'authenticated');
