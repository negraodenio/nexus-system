export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type AudienceType = 'criança' | 'adolescente' | 'adulto' | 'técnico'
export type VisualType = 'mermaid' | 'comparison' | 'timeline' | 'reality'

export type OverlayShape = 'box' | 'circle' | 'arrow'

export interface OverlayItem {
    label: string
    coordinates: number[] // [x, y, w, h] or [x1, y1, x2, y2] depends on shape
    shape: OverlayShape
    color?: string
}

export interface RealityOverlay {
    items: OverlayItem[]
}

export type CacheSource = 'exact' | 'rag' | 'generated'

export type ContextCategory = 'utility' | 'education' | 'social' | 'access'

export interface Context {
    id: string
    name: string
    description: string
    icon: string
    system_prompt: string
    visual_mode: VisualType
    category: ContextCategory
}

export interface Skill {
    id: string
    creator_id: string | null
    title: string
    category: string | null
    difficulty_level: number | null
    tags: string[] | null
    description: string | null
    video_url: string | null
    thumbnail_url?: string | null
    duration_minutes?: number | null
    verification_status?: string
    skeleton_data?: Json
    created_at: string
}

export interface SkillFrame {
    id: string
    skill_id: string
    frame_index: number
    landmarks: Json
    tool_position: Json | null
    created_at: string
}

export interface Database {
    public: {
        Tables: {
            skills: {
                Row: Skill
                Insert: Omit<Skill, 'id' | 'created_at'>
                Update: Partial<Skill>
            }
            skill_frames: {
                Row: SkillFrame
                Insert: Omit<SkillFrame, 'id' | 'created_at'>
                Update: Partial<SkillFrame>
            }
            profiles: {
                Row: {
                    id: string
                    display_name: string | null
                    preferred_audience: AudienceType
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    display_name?: string | null
                    preferred_audience?: AudienceType
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string | null
                    preferred_audience?: AudienceType
                    created_at?: string
                    updated_at?: string
                }
            }
            concepts: {
                Row: {
                    id: string
                    name: string
                    normalized_name: string
                    category: string | null
                    complexity_level: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    normalized_name: string
                    category?: string | null
                    complexity_level?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    normalized_name?: string
                    category?: string | null
                    complexity_level?: number | null
                    created_at?: string
                }
            }
            contexts: {
                Row: {
                    id: string
                    name: string
                    description: string
                    icon: string
                    system_prompt: string
                    visual_mode: VisualType
                    category: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    icon: string
                    system_prompt: string
                    visual_mode: VisualType
                    category: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    icon?: string
                    system_prompt?: string
                    visual_mode?: VisualType
                    category?: string
                    created_at?: string
                }
            }
            analogies: {
                Row: {
                    id: string
                    concept_id: string
                    audience: AudienceType
                    analogy_text: string
                    core_ideas: string[]
                    limits: string[]
                    visual_type: VisualType
                    visual_data: Json
                    embedding: string | null
                    generated_by: string | null
                    quality_score: number | null
                    usage_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    concept_id: string
                    audience: AudienceType
                    analogy_text: string
                    core_ideas?: string[]
                    limits?: string[]
                    visual_type: VisualType
                    visual_data: Json
                    embedding?: string | null
                    generated_by?: string | null
                    quality_score?: number | null
                    usage_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    concept_id?: string
                    audience?: AudienceType
                    analogy_text?: string
                    core_ideas?: string[]
                    limits?: string[]
                    visual_type?: VisualType
                    visual_data?: Json
                    embedding?: string | null
                    generated_by?: string | null
                    quality_score?: number | null
                    usage_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            consultation_sessions: {
                Row: {
                    id: string
                    user_id: string | null
                    concept_id: string
                    analogy_id: string
                    audience_requested: AudienceType
                    cache_source: CacheSource
                    time_to_understand: number | null
                    understood_at: string | null
                    reformulation_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    concept_id: string
                    analogy_id: string
                    audience_requested: AudienceType
                    cache_source: CacheSource
                    time_to_understand?: number | null
                    understood_at?: string | null
                    reformulation_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    concept_id?: string
                    analogy_id?: string
                    audience_requested?: AudienceType
                    cache_source?: CacheSource
                    time_to_understand?: number | null
                    understood_at?: string | null
                    reformulation_count?: number
                    created_at?: string
                }
            }
        }
        Functions: {
            get_exact_analogy: {
                Args: {
                    p_concept_name: string
                    p_audience: AudienceType
                }
                Returns: {
                    id: string
                    concept_id: string
                    analogy_text: string
                    core_ideas: string[]
                    limits: string[]
                    visual_type: VisualType
                    visual_data: Json
                    usage_count: number
                }[]
            }
            match_analogies: {
                Args: {
                    query_embedding: string
                    target_audience: AudienceType
                    match_threshold?: number
                    match_count?: number
                }
                Returns: {
                    id: string
                    concept_id: string
                    concept_name: string
                    analogy_text: string
                    visual_type: VisualType
                    visual_data: Json
                    similarity: number
                }[]
            }
            get_trending_skills: {
                Args: {
                    limit_count: number
                }
                Returns: Json
            }
            get_skill_analytics: {
                Args: {
                    p_skill_id: string
                }
                Returns: Json
            }
        }
    }
}
