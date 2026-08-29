// ============================================================================
// NEXUS PLATFORM - Database Types
// Auto-derived from Supabase migrations. Keep in sync with supabase/migrations/
// ============================================================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// ── Enum helpers ──────────────────────────────────────────────────────────────
export type AudienceType = 'criança' | 'adolescente' | 'adulto' | 'técnico'
export type VisualType = 'mermaid' | 'comparison' | 'timeline' | 'reality'
export type OverlayShape = 'box' | 'circle' | 'arrow'
export type CacheSource = 'exact' | 'rag' | 'generated'
export type ContextCategory = 'utility' | 'education' | 'social' | 'access'
export type UserRole = 'user' | 'creator' | 'admin' | 'enterprise_admin'
export type CompanyMemberRole = 'member' | 'admin' | 'owner'
export type CompanyPlan = 'starter' | 'pro' | 'enterprise'
export type ListingStatus = 'active' | 'sold' | 'archived'
export type LicenseType = 'personal' | 'b2b_batch'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE'
export type AttestationNetwork = 'Polygon Amoy' | 'Polygon Mainnet'
export type VerificationStatus = 'verified' | 'failed'

// ── Domain interfaces ─────────────────────────────────────────────────────────
export interface OverlayItem {
    label: string
    coordinates: number[]
    shape: OverlayShape
    color?: string
}

export interface RealityOverlay {
    items: OverlayItem[]
}

export interface Context {
    id: string
    name: string
    description: string
    icon: string
    system_prompt: string
    visual_mode: VisualType
    category: ContextCategory
}

// ── Table row types (mirrors DB schema) ──────────────────────────────────────
export interface Skill {
    id: string
    creator_id: string | null
    company_id: string | null
    title: string
    name?: string | null
    category: string | null
    difficulty_level: number | null
    tags: string[] | null
    description: string | null
    instructions: string | null
    video_url: string | null
    thumbnail_url?: string | null
    duration_minutes?: number | null
    is_public: boolean
    deleted_at: string | null
    created_at: string
    updated_at?: string | null
}

export interface SkillFrame {
    id: string
    skill_id: string
    frame_index: number
    landmarks: Json
    tool_position: Json | null
    timestamp_ms?: number | null
    deleted_at: string | null
    created_at: string
}

export interface Profile {
    id: string
    email: string | null
    display_name: string | null
    avatar_url: string | null
    company_id: string | null
    role: UserRole
    balance: number
    total_earned: number
    preferred_audience?: AudienceType | null
    deleted_at: string | null
    created_at: string
    updated_at?: string | null
}

export interface Company {
    id: string
    name: string
    slug: string
    logo_url: string | null
    settings: Json
    plan: CompanyPlan
    corporate_balance: number
    created_at: string
    updated_at: string
}

export interface CompanyMember {
    id: string
    company_id: string
    user_id: string
    role: CompanyMemberRole
    invited_at: string
    joined_at: string | null
}

export interface MarketplaceListing {
    id: string
    skill_id: string
    seller_id: string
    title: string
    description: string | null
    price: number
    currency: string
    status: ListingStatus
    royalty_split: number
    is_premium: boolean
    license_type: LicenseType
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    listing_id: string
    buyer_id: string
    seller_id: string
    amount: number
    currency: string
    batch_size: number
    platform_fee: number
    creator_cut: number
    created_at: string
}

export interface AuditLog {
    id: string
    table_name: string
    record_id: string
    action: AuditAction
    old_data: Json | null
    new_data: Json | null
    user_id: string | null
    ip_address: string | null
    user_agent: string | null
    created_at: string
}

export interface SkillView {
    id: string
    skill_id: string | null
    user_id: string | null
    session_id: string | null
    viewed_at: string
    duration_seconds: number
    completed: boolean
}

export interface LearningProgress {
    id: string
    user_id: string
    skill_id: string
    practice_count: number
    best_alignment_score: number
    total_practice_time_seconds: number
    last_practiced_at: string
    created_at: string
}

export interface SkillEmbedding {
    id: string
    skill_id: string | null
    embedding: string | null
    content: string | null
    created_at: string
}

export interface SkillAttestation {
    id: string
    user_id: string
    skill_id: string
    score: number
    ipfs_hash: string
    transaction_hash: string
    network: AttestationNetwork
    metadata: Json
    created_at: string
}

export interface CertificateVerification {
    id: string
    attestation_id: string | null
    verifier_id: string | null
    status: VerificationStatus
    created_at: string
}

export interface FieldTelemetry {
    id?: string
    session_id: string
    company_id: string
    tech_id: string
    module_id: string
    step_index: number
    score: number
    metadata: Record<string, Json> | undefined
    created_at: string
}

// ── Supabase Database type (used by createClient<Database>) ──────────────────
export interface Database {
    public: {
        Tables: {
            skills: {
                Row: Skill
                Insert: Omit<Skill, 'id' | 'created_at'>
                Update: Partial<Omit<Skill, 'id' | 'created_at'>>
            }
            skill_frames: {
                Row: SkillFrame
                Insert: Omit<SkillFrame, 'id' | 'created_at'>
                Update: Partial<Omit<SkillFrame, 'id' | 'created_at'>>
            }
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'created_at' | 'balance' | 'total_earned'>
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>
            }
            companies: {
                Row: Company
                Insert: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'corporate_balance'>
                Update: Partial<Omit<Company, 'id' | 'created_at'>>
            }
            company_members: {
                Row: CompanyMember
                Insert: Omit<CompanyMember, 'id' | 'invited_at'>
                Update: Partial<Omit<CompanyMember, 'id'>>
            }
            marketplace_listings: {
                Row: MarketplaceListing
                Insert: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<MarketplaceListing, 'id' | 'created_at'>>
            }
            transactions: {
                Row: Transaction
                Insert: Omit<Transaction, 'id' | 'created_at'>
                Update: Partial<Omit<Transaction, 'id' | 'created_at'>>
            }
            audit_logs: {
                Row: AuditLog
                Insert: Omit<AuditLog, 'id' | 'created_at'>
                Update: never
            }
            skill_views: {
                Row: SkillView
                Insert: Omit<SkillView, 'id' | 'viewed_at'>
                Update: Partial<Omit<SkillView, 'id' | 'viewed_at'>>
            }
            learning_progress: {
                Row: LearningProgress
                Insert: Omit<LearningProgress, 'id' | 'created_at'>
                Update: Partial<Omit<LearningProgress, 'id' | 'created_at'>>
            }
            skill_embeddings: {
                Row: SkillEmbedding
                Insert: Omit<SkillEmbedding, 'id' | 'created_at'>
                Update: Partial<Omit<SkillEmbedding, 'id' | 'created_at'>>
            }
            skill_attestations: {
                Row: SkillAttestation
                Insert: Omit<SkillAttestation, 'id' | 'created_at'>
                Update: never
            }
            certificate_verifications: {
                Row: CertificateVerification
                Insert: Omit<CertificateVerification, 'id' | 'created_at'>
                Update: Partial<Omit<CertificateVerification, 'id' | 'created_at'>>
            }
            field_telemetry: {
                Row: FieldTelemetry
                Insert: Omit<FieldTelemetry, 'id'>
                Update: Partial<Omit<FieldTelemetry, 'id' | 'created_at'>>
            }
            // Legacy tables retained for backward compatibility
            concepts: {
                Row: {
                    id: string
                    name: string
                    normalized_name: string
                    category: string | null
                    complexity_level: number | null
                    created_at: string
                }
                Insert: Omit<{ id: string; name: string; normalized_name: string; category: string | null; complexity_level: number | null; created_at: string }, 'id' | 'created_at'>
                Update: Partial<{ name: string; normalized_name: string; category: string | null; complexity_level: number | null }>
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
                Insert: Omit<{ id: string; name: string; description: string; icon: string; system_prompt: string; visual_mode: VisualType; category: string; created_at: string }, 'id' | 'created_at'>
                Update: Partial<{ name: string; description: string; icon: string; system_prompt: string; visual_mode: VisualType; category: string }>
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
                Insert: Omit<{ id: string; concept_id: string; audience: AudienceType; analogy_text: string; core_ideas: string[]; limits: string[]; visual_type: VisualType; visual_data: Json; embedding: string | null; generated_by: string | null; quality_score: number | null; usage_count: number; created_at: string; updated_at: string }, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<{ concept_id: string; audience: AudienceType; analogy_text: string; core_ideas: string[]; limits: string[]; visual_type: VisualType; visual_data: Json; embedding: string | null; generated_by: string | null; quality_score: number | null; usage_count: number }>
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
                Insert: Omit<{ id: string; user_id: string | null; concept_id: string; analogy_id: string; audience_requested: AudienceType; cache_source: CacheSource; time_to_understand: number | null; understood_at: string | null; reformulation_count: number; created_at: string }, 'id' | 'created_at'>
                Update: Partial<{ user_id: string | null; concept_id: string; analogy_id: string; audience_requested: AudienceType; cache_source: CacheSource; time_to_understand: number | null; understood_at: string | null; reformulation_count: number }>
            }
        }
        Functions: {
            get_exact_analogy: {
                Args: { p_concept_name: string; p_audience: AudienceType }
                Returns: {
                    id: string; concept_id: string; analogy_text: string
                    core_ideas: string[]; limits: string[]; visual_type: VisualType
                    visual_data: Json; usage_count: number
                }[]
            }
            match_analogies: {
                Args: { query_embedding: string; target_audience: AudienceType; match_threshold?: number; match_count?: number }
                Returns: {
                    id: string; concept_id: string; concept_name: string
                    analogy_text: string; visual_type: VisualType; visual_data: Json; similarity: number
                }[]
            }
            search_skills_semantic: {
                Args: { query_embedding: number[]; match_threshold?: number; match_count?: number }
                Returns: {
                    skill_id: string; title: string; description: string | null
                    video_url: string | null; similarity: number
                }[]
            }
            get_trending_skills: {
                Args: { limit_count: number }
                Returns: { skill_id: string; title: string; view_count: number }[]
            }
            get_skill_analytics: {
                Args: { p_skill_id: string }
                Returns: {
                    total_views: number; unique_viewers: number
                    avg_duration: number; completion_rate: number
                }[]
            }
            get_user_company: {
                Args: { p_user_id: string }
                Returns: {
                    company_id: string; company_name: string
                    company_slug: string; user_role: string
                }[]
            }
            save_skill_atomic: {
                Args: {
                    p_skill_id?: string; p_skill_name: string
                    p_skill_description?: string; p_is_public?: boolean
                    p_video_url?: string; p_thumbnail_url?: string; p_frames?: Json
                }
                Returns: string
            }
            process_skill_purchase: {
                Args: { p_buyer_id: string; p_listing_id: string; p_amount: number; p_batch_size?: number }
                Returns: Json
            }
            gdpr_delete_user_data: {
                Args: { p_user_id?: string }
                Returns: Json
            }
        }
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}
