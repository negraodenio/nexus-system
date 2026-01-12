-- Seed Data for MEO Demo
-- This script populates the database with the "Happy Path" skills for the presentation.

INSERT INTO public.skills (
    title, 
    description, 
    video_url, 
    thumbnail_url, 
    difficulty_level, 
    duration_minutes, 
    category, 
    tags, 
    verification_status,
    instructions,
    skeleton_data
) VALUES 
(
    'Diagnóstico LOS FiberGateway GR241GE', -- Title
    'Procedimento padrão para diagnóstico de falha de sinal óptico (Lose of Signal) em routers FiberGateway. Inclui verificação de patch cord e potenciais dobras.', -- Description
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', -- Placeholder Video
    '/nexus_meo_router_diagnostic_1767873857942.png', -- Thumbnail (From our assets!)
    1, -- difficulty_level (1=Beginner)
    5,
    'Technical Support',
    ARRAY['MEO', 'FiberGateway', 'LOS', 'CPE', 'Diagnostico', 'Router'],
    'verified',
    '[
        {"time": 0, "text": "Verifique se o LED PON está a piscar vermelho."},
        {"time": 5, "text": "Inspecione o patch cord amarelo para ver se há dobras excessivas (raio < 3cm)."},
        {"time": 15, "text": "Desconecte e limpe o conector APC (verde) com a caneta de limpeza."},
        {"time": 30, "text": "Reinicie o equipamento e aguarda a sincronização."}
    ]'::jsonb,
    '[]'::jsonb -- Empty skeleton for this one (AR Text focus)
),
(
    'Fusão Óptica Padrão MEO', -- Title
    'Passo a passo para realização de fusão em fibra monomodo G.657.A2 utilizando máquina de fusão Fujikura.', -- Description
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', -- Placeholder video
    'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=1000&auto=format&fit=crop', -- Thumbnail
    5, -- difficulty_level (5=Expert)
    15,
    'Field Operations',
    ARRAY['MEO', 'Fibra', 'FTTH', 'Fusão', 'Treinamento', 'Optical'],
    'verified',
    '[
        {"time": 0, "text": "Decape 3cm da fibra utilizando o alicate de precisão."},
        {"time": 10, "text": "Limpe a fibra com álcool isopropílico."},
        {"time": 20, "text": "Realize o corte (clivagem) garantindo ângulo < 0.5 graus."},
        {"time": 40, "text": "Posicione na máquina de fusão e feche a tampa."}
    ]'::jsonb,
    '[{"frame":0, "landmarks": []}]'::jsonb -- Mock skeleton
);
