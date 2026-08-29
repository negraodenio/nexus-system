/**
 * @fileoverview Category & Niche System
 * @description Supports ALL market verticals with hierarchical categorization.
 *              Enables the "Invisible First" paradigm across 10+ industries.
 *
 * Architecture:
 *   Category → Subcategory → Niche → Procedure
 *
 * Each level adds metadata for:
 *   - Difficulty calibration
 *   - Certification requirements
 *   - Safety criticality
 *   - Regulatory compliance
 *   - Language localization
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type SafetyLevel = 'low' | 'medium' | 'high' | 'critical'
export type CertificationRequired = 'none' | 'basic' | 'professional' | 'specialist'

export interface Category {
    id: string
    name: string
    nameEn: string
    nameEs: string
    nameFr: string
    nameDe: string
    icon: string
    description: string
    subcategories: Subcategory[]
    safetyLevel: SafetyLevel
    certificationRequired: CertificationRequired
    marketSize: string // EUR
    targetAudience: string[]
}

export interface Subcategory {
    id: string
    name: string
    nameEn: string
    nameEs: string
    nameFr: string
    nameDe: string
    icon: string
    niches: Niche[]
    difficulty: DifficultyLevel
    estimatedProcedures: number
}

export interface Niche {
    id: string
    name: string
    nameEn: string
    nameEs: string
    nameFr: string
    nameDe: string
    description: string
    difficulty: DifficultyLevel
    safetyLevel: SafetyLevel
    certificationRequired: CertificationRequired
    estimatedProcedures: number
    exampleProcedures: string[]
    regulatoryBodies?: string[]
    tags: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Categories Database
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. INDUSTRIA & MANUTENÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'industria',
        name: 'Indústria & Manutenção',
        nameEn: 'Industry & Maintenance',
        nameEs: 'Industria y Mantenimiento',
        nameFr: 'Industrie & Maintenance',
        nameDe: 'Industrie & Wartung',
        icon: '🏭',
        description: 'Manutenção industrial, telecomunicações, energia, utilities',
        subcategories: [
            {
                id: 'telecom',
                name: 'Telecomunicações',
                nameEn: 'Telecommunications',
                nameEs: 'Telecomunicaciones',
                nameFr: 'Télécommunications',
                nameDe: 'Telekommunikation',
                icon: '📡',
                niches: [
                    {
                        id: 'fibra-optica',
                        name: 'Fibra Óptica',
                        nameEn: 'Fiber Optics',
                        nameEs: 'Fibra Óptica',
                        nameFr: 'Fibre Optique',
                        nameDe: 'Glasfaser',
                        description: 'Instalação, manutenção e reparação de redes de fibra óptica',
                        difficulty: 'advanced',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Emendação de fibra óptica',
                            'Teste de continuidade OTDR',
                            'Instalação patch panel',
                            'Crimpagem conectores SC/APC',
                            'Medição atenuação',
                        ],
                        regulatoryBodies: ['ANACOM', 'ETSI'],
                        tags: ['fibra', 'óptica', 'telecom', 'FTTH', 'FTTB'],
                    },
                    {
                        id: 'rede-cobre',
                        name: 'Rede Cobre',
                        nameEn: 'Copper Network',
                        nameEs: 'Red de Cobre',
                        nameFr: 'Réseau Cuivre',
                        nameDe: 'Kupfernetz',
                        description: 'Instalação e manutenção de redes de cobre (par trançado, coaxial)',
                        difficulty: 'intermediate',
                        safetyLevel: 'medium',
                        certificationRequired: 'basic',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Crimpagem RJ45',
                            'Teste velocidade link',
                            'Instalação splitter',
                            'Medição ruído',
                        ],
                        tags: ['cobre', 'RJ45', 'Ethernet', 'DSL'],
                    },
                    {
                        id: 'configuracao-equipamentos',
                        name: 'Configuração Equipamentos',
                        nameEn: 'Equipment Configuration',
                        nameEs: 'Configuración de Equipos',
                        nameFr: "Configuration d'Équipements",
                        nameDe: 'Gerätekonfiguration',
                        description: 'Configuração de routers, switches, ONTs, OLTs',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'basic',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Configuração router WiFi',
                            'Provisionamento ONT',
                            'Configuração VLAN',
                            'Atualização firmware',
                        ],
                        tags: ['router', 'switch', 'ONT', 'OLT', 'configuração'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 120,
            },
            {
                id: 'energia',
                name: 'Energia',
                nameEn: 'Energy',
                nameEs: 'Energía',
                nameFr: 'Énergie',
                nameDe: 'Energie',
                icon: '⚡',
                niches: [
                    {
                        id: 'quadros-eletricos',
                        name: 'Quadros Elétricos',
                        nameEn: 'Electrical Panels',
                        nameEs: 'Cuadros Eléctricos',
                        nameFr: 'Tableaux Électriques',
                        nameDe: 'Elektroschränke',
                        description: 'Instalação, manutenção e medição de quadros elétricos',
                        difficulty: 'advanced',
                        safetyLevel: 'critical',
                        certificationRequired: 'specialist',
                        estimatedProcedures: 60,
                        exampleProcedures: [
                            'Medição tensão/frequência',
                            'Teste isolamento',
                            'Manutenção preventiva',
                            'Substituição disjuntores',
                        ],
                        regulatoryBodies: ['DGEG', 'ERE'],
                        tags: ['elétrico', 'quadro', 'tensão', 'corrente', 'disjuntor'],
                    },
                    {
                        id: 'transformadores',
                        name: 'Transformadores',
                        nameEn: 'Transformers',
                        nameEs: 'Transformadores',
                        nameFr: 'Transformateurs',
                        nameDe: 'Transformatoren',
                        description: 'Manutenção e teste de transformadores de potência',
                        difficulty: 'expert',
                        safetyLevel: 'critical',
                        certificationRequired: 'specialist',
                        estimatedProcedures: 25,
                        exampleProcedures: [
                            'Ensaio óleo isolante',
                            'Medição resistência enrolamentos',
                            'Termografia infravermelhos',
                        ],
                        regulatoryBodies: ['DGEG', 'ERE', 'ENEC'],
                        tags: ['transformador', 'potência', 'óleo', 'isolamento'],
                    },
                    {
                        id: 'energia-renovavel',
                        name: 'Energia Renovável',
                        nameEn: 'Renewable Energy',
                        nameEs: 'Energía Renovable',
                        nameFr: 'Énergie Renouvelable',
                        nameDe: 'Erneuerbare Energien',
                        description: 'Instalação e manutenção de painéis solares, eólicas',
                        difficulty: 'advanced',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 35,
                        exampleProcedures: [
                            'Instalação painéis solares',
                            'Configuração inversor',
                            'Manutenção eólica',
                            'Medição produção',
                        ],
                        tags: ['solar', 'eólica', 'fotovoltaico', 'inversor'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 120,
            },
            {
                id: 'aguas',
                name: 'Águas & Saneamento',
                nameEn: 'Water & Sanitation',
                nameEs: 'Aguas y Saneamiento',
                nameFr: 'Eau & Assainissement',
                nameDe: 'Wasser & Abwasser',
                icon: '💧',
                niches: [
                    {
                        id: 'tratamento-aguas',
                        name: 'Tratamento de Águas',
                        nameEn: 'Water Treatment',
                        nameEs: 'Tratamiento de Aguas',
                        nameFr: "Traitement de l'Eau",
                        nameDe: 'Wasseraufbereitung',
                        description: 'Processos de tratamento e potabilização de águas',
                        difficulty: 'advanced',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Medição pH/cloro',
                            'Calibração analisadores',
                            'Manutenção filtros',
                            'Procedimento coagulação',
                        ],
                        regulatoryBodies: ['ERSAR', 'DGA'],
                        tags: ['água', 'tratamento', 'pH', 'cloro', 'ETAR'],
                    },
                    {
                        id: 'contadores',
                        name: 'Contadores',
                        nameEn: 'Meters',
                        nameEs: 'Contadores',
                        nameFr: 'Compteurs',
                        nameDe: 'Zähler',
                        description: 'Leitura, instalação e manutenção de contadores',
                        difficulty: 'intermediate',
                        safetyLevel: 'medium',
                        certificationRequired: 'basic',
                        estimatedProcedures: 20,
                        exampleProcedures: [
                            'Leitura contadores',
                            'Substituição contadores',
                            'Teste precisão',
                            'Detecção fugas',
                        ],
                        tags: ['contador', 'leitura', 'medidor', 'fuga'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 60,
            },
            {
                id: 'industria-manufatura',
                name: 'Manufatura',
                nameEn: 'Manufacturing',
                nameEs: 'Manufactura',
                nameFr: 'Fabrication',
                nameDe: 'Fertigung',
                icon: '🔧',
                niches: [
                    {
                        id: 'automacao',
                        name: 'Automação Industrial',
                        nameEn: 'Industrial Automation',
                        nameEs: 'Automatización Industrial',
                        nameFr: 'Automatisation Industrielle',
                        nameDe: 'Industrielle Automatisierung',
                        description: 'PLC, SCADA, robótica industrial',
                        difficulty: 'expert',
                        safetyLevel: 'critical',
                        certificationRequired: 'specialist',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Programação PLC',
                            'Configuração SCADA',
                            'Manutenção robôs',
                            'Calibração sensores',
                        ],
                        tags: ['PLC', 'SCADA', 'robô', 'automação', 'sensor'],
                    },
                    {
                        id: 'quality-control',
                        name: 'Controlo Qualidade',
                        nameEn: 'Quality Control',
                        nameEs: 'Control de Calidad',
                        nameFr: 'Contrôle Qualité',
                        nameDe: 'Qualitätskontrolle',
                        description: 'Inspeção, medição, garantia de qualidade',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'basic',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Inspeção visual',
                            'Medição dimensional',
                            'Teste resistência',
                            'Análise estatística',
                        ],
                        tags: ['qualidade', 'inspeção', 'medição', 'tolerância'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 80,
            },
        ],
        safetyLevel: 'high',
        certificationRequired: 'professional',
        marketSize: '€40B',
        targetAudience: ['Técnicos', 'Engenheiros', 'Manutenção'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. CONSTRUÇÃO & OFÍCIOS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'construcao',
        name: 'Construção & Ofícios',
        nameEn: 'Construction & Trades',
        nameEs: 'Construcción y Oficios',
        nameFr: 'Construction & Métiers',
        nameDe: 'Bauhandwerk',
        icon: '🏗️',
        description: 'Eletricidade, canalização, soldadura, carpintaria',
        subcategories: [
            {
                id: 'eletricidade',
                name: 'Eletricidade',
                nameEn: 'Electrical',
                nameEs: 'Electricidad',
                nameFr: 'Électricité',
                nameDe: 'Elektrik',
                icon: '⚡',
                niches: [
                    {
                        id: 'instalacao-residencial',
                        name: 'Instalação Residencial',
                        nameEn: 'Residential Installation',
                        nameEs: 'Instalación Residencial',
                        nameFr: 'Installation Résidentielle',
                        nameDe: 'Wohnungsinstallation',
                        description: 'Instalação elétrica doméstica',
                        difficulty: 'intermediate',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Instalação tomadas',
                            'Substituição quadro',
                            'Teste continuidade',
                            'Marcação circuitos',
                        ],
                        tags: ['elétrico', 'residencial', 'tomada', 'interruptor'],
                    },
                    {
                        id: 'instalacao-industrial',
                        name: 'Instalação Industrial',
                        nameEn: 'Industrial Installation',
                        nameEs: 'Instalación Industrial',
                        nameFr: 'Installation Industrielle',
                        nameDe: 'Industrielle Installation',
                        description: 'Instalação elétrica industrial e comercial',
                        difficulty: 'advanced',
                        safetyLevel: 'critical',
                        certificationRequired: 'specialist',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Cabeamento canalizações',
                            'Instalação motores',
                            'Configuração quadros',
                            'Teste IR',
                        ],
                        tags: ['industrial', 'motor', 'quadro', 'cabeamento'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 90,
            },
            {
                id: 'canalizacao',
                name: 'Canalização',
                nameEn: 'Plumbing',
                nameEs: 'Fontanería',
                nameFr: 'Plomberie',
                nameDe: 'Rohrleitungsbau',
                icon: '🔧',
                niches: [
                    {
                        id: 'agua-fria',
                        name: 'Água Fria',
                        nameEn: 'Cold Water',
                        nameEs: 'Agua Fría',
                        nameFr: 'Eau Froide',
                        nameDe: 'Kaltwasser',
                        description: 'Instalação e reparação de redes de água fria',
                        difficulty: 'intermediate',
                        safetyLevel: 'medium',
                        certificationRequired: 'basic',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Substituição torneira',
                            'Reparação fuga',
                            'Instalação rega',
                            'Medição pressão',
                        ],
                        tags: ['água', 'fria', 'torneira', 'fuga'],
                    },
                    {
                        id: 'aquecimento',
                        name: 'Aquecimento',
                        nameEn: 'Heating',
                        nameEs: 'Calefacción',
                        nameFr: 'Chauffage',
                        nameDe: 'Heizung',
                        description: 'Sistemas de aquecimento e climatização',
                        difficulty: 'advanced',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 35,
                        exampleProcedures: [
                            'Instalação caldeira',
                            'Lavagem radiadores',
                            'Configuração termostato',
                            'Manutenção preventiva',
                        ],
                        tags: ['aquecimento', 'caldeira', 'radiador', 'termostato'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 65,
            },
            {
                id: 'soldadura',
                name: 'Soldadura',
                nameEn: 'Welding',
                nameEs: 'Soldadura',
                nameFr: 'Soudage',
                nameDe: 'Schweißen',
                icon: '🔥',
                niches: [
                    {
                        id: 'mig-mag',
                        name: 'MIG/MAG',
                        nameEn: 'MIG/MAG',
                        nameEs: 'MIG/MAG',
                        nameFr: 'MIG/MAG',
                        nameDe: 'MIG/MAG',
                        description: 'Soldadura MIG/MAG',
                        difficulty: 'intermediate',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 20,
                        exampleProcedures: [
                            'Configuração equipamento',
                            'Preparação juntas',
                            'Execução cordão',
                            'Inspeção visual',
                        ],
                        tags: ['soldadura', 'MIG', 'MAG', 'cordão'],
                    },
                    {
                        id: 'tig',
                        name: 'TIG',
                        nameEn: 'TIG',
                        nameEs: 'TIG',
                        nameFr: 'TIG',
                        nameDe: 'WIG',
                        description: 'Soldadura TIG (Wolfram)',
                        difficulty: 'advanced',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 25,
                        exampleProcedures: [
                            'Preparação eletrodo',
                            'Configuração gás',
                            'Execução soldadura',
                            'Tratamento pós-soldadura',
                        ],
                        tags: ['TIG', 'wolfram', 'inerte', 'precisão'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 45,
            },
        ],
        safetyLevel: 'high',
        certificationRequired: 'professional',
        marketSize: '€25B',
        targetAudience: ['Eletricistas', 'Canalizadores', 'Soldadores', 'Carpinteiros'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. SAÚDE & BEM-ESTAR
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'saude',
        name: 'Saúde & Bem-Estar',
        nameEn: 'Health & Wellness',
        nameEs: 'Salud y Bienestar',
        nameFr: 'Santé & Bien-être',
        nameDe: 'Gesundheit & Wellness',
        icon: '🏥',
        description: 'Enfermagem, fisioterapia, cuidados idosos, primeiros socorros',
        subcategories: [
            {
                id: 'enfermagem',
                name: 'Enfermagem',
                nameEn: 'Nursing',
                nameEs: 'Enfermería',
                nameFr: 'Infirmier',
                nameDe: 'Krankenpflege',
                icon: '💉',
                niches: [
                    {
                        id: 'cuidados-enfermagem',
                        name: 'Cuidados de Enfermagem',
                        nameEn: 'Nursing Care',
                        nameEs: 'Cuidados de Enfermería',
                        nameFr: 'Soins Infirmiers',
                        nameDe: 'Krankenpflege',
                        description: 'Procedimentos de enfermagem gerais',
                        difficulty: 'advanced',
                        safetyLevel: 'critical',
                        certificationRequired: 'professional',
                        estimatedProcedures: 80,
                        exampleProcedures: [
                            'Administração medicação',
                            'Curativos feridas',
                            'Colocação cateter',
                            'Injeções intramusculares',
                            'Mudança posicionamento',
                        ],
                        regulatoryBodies: ['Ordem Enfermeiros', 'DGS'],
                        tags: ['enfermagem', 'injeção', 'cateter', 'curativo'],
                    },
                    {
                        id: 'cuidados-intensivos',
                        name: 'Cuidados Intensivos',
                        nameEn: 'Intensive Care',
                        nameEs: 'Cuidados Intensivos',
                        nameFr: 'Soins Intensifs',
                        nameDe: 'Intensivpflege',
                        description: 'Procedimentos de cuidados intensivos',
                        difficulty: 'expert',
                        safetyLevel: 'critical',
                        certificationRequired: 'specialist',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Ventilação mecânica',
                            'Monitorização contínua',
                            'Administração drogas vasoativas',
                        ],
                        tags: ['UTI', 'ventilação', 'monitorização', 'vasoativas'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 120,
            },
            {
                id: 'primeiros-socorros',
                name: 'Primeiros Socorros',
                nameEn: 'First Aid',
                nameEs: 'Primeros Auxilios',
                nameFr: 'Premiers Secours',
                nameDe: 'Erste Hilfe',
                icon: '🚑',
                niches: [
                    {
                        id: 'rcp',
                        name: 'RCP & DEA',
                        nameEn: 'CPR & AED',
                        nameEs: 'RCP & DEA',
                        nameFr: 'RCP & DAE',
                        nameDe: 'HLW & AED',
                        description: 'Reanimação cardiopulmonar e desfibrilhador',
                        difficulty: 'intermediate',
                        safetyLevel: 'critical',
                        certificationRequired: 'basic',
                        estimatedProcedures: 15,
                        exampleProcedures: [
                            'Avaliação consciente',
                            'Compressões torácicas',
                            'Ventilações',
                            'Utilização DEA',
                        ],
                        tags: ['RCP', 'DEA', 'reanimação', 'desfibrilhador'],
                    },
                    {
                        id: 'traumatologia',
                        name: 'Traumatologia',
                        nameEn: 'Traumatology',
                        nameEs: 'Traumatología',
                        nameFr: 'Traumatologie',
                        nameDe: 'Traumatologie',
                        description: 'Imobilização, transporte, ferimentos',
                        difficulty: 'intermediate',
                        safetyLevel: 'high',
                        certificationRequired: 'basic',
                        estimatedProcedures: 25,
                        exampleProcedures: [
                            'Imobilização fraturas',
                            'Tratamento queimaduras',
                            'Transporte doente',
                        ],
                        tags: ['fratura', 'imobilização', 'queimadura', 'transporte'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 40,
            },
            {
                id: 'fisioterapia',
                name: 'Fisioterapia',
                nameEn: 'Physiotherapy',
                nameEs: 'Fisioterapia',
                nameFr: 'Physiothérapie',
                nameDe: 'Physiotherapie',
                icon: '🏃',
                niches: [
                    {
                        id: 'reabilitacao',
                        name: 'Reabilitação',
                        nameEn: 'Rehabilitation',
                        nameEs: 'Rehabilitación',
                        nameFr: 'Réhabilitation',
                        nameDe: 'Rehabilitation',
                        description: 'Exercícios de reabilitação funcional',
                        difficulty: 'advanced',
                        safetyLevel: 'medium',
                        certificationRequired: 'professional',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Exercícios fortalecimento',
                            'Mobilização articular',
                            'Exercícios equilíbrio',
                            'Reabilitação membro superior',
                        ],
                        tags: ['fisioterapia', 'reabilitação', 'exercício', 'mobilização'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 50,
            },
        ],
        safetyLevel: 'critical',
        certificationRequired: 'professional',
        marketSize: '€35B',
        targetAudience: ['Enfermeiros', 'Médicos', 'Técnicos', 'Pais'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. ALIMENTAÇÃO & BEBIDAS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'alimentacao',
        name: 'Alimentação & Bebidas',
        nameEn: 'Food & Beverage',
        nameEs: 'Alimentación y Bebidas',
        nameFr: 'Alimentation & Boissons',
        nameDe: 'Lebensmittel & Getränke',
        icon: '🍽️',
        description: 'Cozinha, pastelaria, bar, segurança alimentar',
        subcategories: [
            {
                id: 'cozinha',
                name: 'Cozinha',
                nameEn: 'Cooking',
                nameEs: 'Cocina',
                nameFr: 'Cuisine',
                nameDe: 'Küche',
                icon: '👨‍🍳',
                niches: [
                    {
                        id: 'tecnica-culinaria',
                        name: 'Técnicas Culinárias',
                        nameEn: 'Cooking Techniques',
                        nameEs: 'Técnicas Culinarias',
                        nameFr: 'Techniques Culinaires',
                        nameDe: 'Kochtechniken',
                        description: 'Técnicas básicas e avançadas de cozinha',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 100,
                        exampleProcedures: [
                            'Corte de legumes',
                            'Cozimento massas',
                            'Confecção molhos',
                            'Temperatura carnes',
                        ],
                        tags: ['cozinha', 'corte', 'temperatura', 'molho'],
                    },
                    {
                        id: 'confeitaria',
                        name: 'Confeitaria',
                        nameEn: 'Confectionery',
                        nameEs: 'Repostería',
                        nameFr: 'Pâtisserie',
                        nameDe: 'Konditorei',
                        description: 'Bolos, doces, pão artesanal',
                        difficulty: 'advanced',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 60,
                        exampleProcedures: [
                            'Fermentação pão',
                            'Cobertura bolos',
                            'Temperatura chocolate',
                            'Decoração',
                        ],
                        tags: ['confeitaria', 'pão', 'bolo', 'chocolate'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 160,
            },
            {
                id: 'bar',
                name: 'Bar & Bebidas',
                nameEn: 'Bar & Drinks',
                nameEs: 'Bar y Bebidas',
                nameFr: 'Bar & Boissons',
                nameDe: 'Bar & Getränke',
                icon: '🍸',
                niches: [
                    {
                        id: 'cocktails',
                        name: 'Cocktails',
                        nameEn: 'Cocktails',
                        nameEs: 'Cócteles',
                        nameFr: 'Cocktails',
                        nameDe: 'Cocktails',
                        description: 'Preparação de cocktails clássicos e modernos',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Mojito',
                            'Caipirinha',
                            'Negroni',
                            'Técnicas de mixologia',
                        ],
                        tags: ['cocktail', 'bar', 'mixologia', 'drink'],
                    },
                    {
                        id: 'expresso',
                        name: 'Café Expresso',
                        nameEn: 'Espresso',
                        nameEs: 'Café Expreso',
                        nameFr: 'Expresso',
                        nameDe: 'Espresso',
                        description: 'Extração café expresso e latte art',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 20,
                        exampleProcedures: [
                            'Extração expresso',
                            'Latte art',
                            'Manutenção máquina',
                            'Moagem grãos',
                        ],
                        tags: ['café', 'expresso', 'latte', 'máquina'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 70,
            },
            {
                id: 'seguranca-alimentar',
                name: 'Segurança Alimentar',
                nameEn: 'Food Safety',
                nameEs: 'Seguridad Alimentaria',
                nameFr: 'Sécurité Alimentaire',
                nameDe: 'Lebensmittelsicherheit',
                icon: '🛡️',
                niches: [
                    {
                        id: 'haccp',
                        name: 'HACCP',
                        nameEn: 'HACCP',
                        nameEs: 'HACCP',
                        nameFr: 'HACCP',
                        nameDe: 'HACCP',
                        description: 'Análise de perigos e pontos críticos de controlo',
                        difficulty: 'advanced',
                        safetyLevel: 'high',
                        certificationRequired: 'professional',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Análise perigos',
                            'Identificação CCP',
                            'Monitorização temperaturas',
                            'Registos higiene',
                        ],
                        regulatoryBodies: ['ASAE', 'EFSA'],
                        tags: ['HACCP', 'higiene', 'temperatura', 'perigo'],
                    },
                ],
                difficulty: 'advanced',
                estimatedProcedures: 30,
            },
        ],
        safetyLevel: 'medium',
        certificationRequired: 'none',
        marketSize: '€30B',
        targetAudience: ['Cozinheiros', 'Baristas', 'Pais', 'Estudantes'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. CASA & DIY
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'casa',
        name: 'Casa & DIY',
        nameEn: 'Home & DIY',
        nameEs: 'Hogar y Bricolaje',
        nameFr: 'Maison & Bricolage',
        nameDe: 'Haus & Heimwerker',
        icon: '🏠',
        description: 'Reparações domésticas, montagem móveis, jardinagem',
        subcategories: [
            {
                id: 'reparacoes',
                name: 'Reparações Domésticas',
                nameEn: 'Home Repairs',
                nameEs: 'Reparaciones Domésticas',
                nameFr: 'Réparations Maison',
                nameDe: 'Hausreparaturen',
                icon: '🔧',
                niches: [
                    {
                        id: 'canalizacao-basica',
                        name: 'Canalização Básica',
                        nameEn: 'Basic Plumbing',
                        nameEs: 'Fontanería Básica',
                        nameFr: 'Plomberie Basique',
                        nameDe: 'Grundlegende Sanitär',
                        description: 'Reparações simples de canalização',
                        difficulty: 'beginner',
                        safetyLevel: 'medium',
                        certificationRequired: 'none',
                        estimatedProcedures: 20,
                        exampleProcedures: [
                            'Desentupir canos',
                            'Substituição torneira',
                            'Reparação sanita',
                        ],
                        tags: ['canalização', 'torneira', 'sanita', 'cano'],
                    },
                    {
                        id: 'eletricidade-basica',
                        name: 'Eletricidade Básica',
                        nameEn: 'Basic Electrical',
                        nameEs: 'Electricidad Básica',
                        nameFr: 'Électricité Basique',
                        nameDe: 'Grundlegende Elektrik',
                        description: 'Reparações simples de eletricidade',
                        difficulty: 'intermediate',
                        safetyLevel: 'high',
                        certificationRequired: 'none',
                        estimatedProcedures: 15,
                        exampleProcedures: [
                            'Substituição interruptor',
                            'Instalação lâmpada',
                            'Detetar curto-circuito',
                        ],
                        tags: ['elétrico', 'interruptor', 'lâmpada', 'curto'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 35,
            },
            {
                id: 'montagem-moveis',
                name: 'Montagem Móveis',
                nameEn: 'Furniture Assembly',
                nameEs: 'Montaje de Muebles',
                nameFr: 'Montage Meubles',
                nameDe: 'Möbelmontage',
                icon: '🪑',
                niches: [
                    {
                        id: 'ikea',
                        name: 'Móveis Planos',
                        nameEn: 'Flat-Pack Furniture',
                        nameEs: 'Muebles Planos',
                        nameFr: 'Meubles Démontables',
                        nameDe: 'Flachpack-Möbel',
                        description: 'Montagem de móveis IKEA e similares',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Montagem estante',
                            'Montagem armário',
                            'Montagem cama',
                            'Montagem secretária',
                        ],
                        tags: ['IKEA', 'móvel', 'montagem', 'parafuso'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 50,
            },
            {
                id: 'jardinagem',
                name: 'Jardinagem',
                nameEn: 'Gardening',
                nameEs: 'Jardinería',
                nameFr: 'Jardinage',
                nameDe: 'Gartenarbeit',
                icon: '🌱',
                niches: [
                    {
                        id: 'poda',
                        name: 'Poda',
                        nameEn: 'Pruning',
                        nameEs: 'Poda',
                        nameFr: 'Taillage',
                        nameDe: 'Schnitt',
                        description: 'Técnicas de poda de árvores e arbustos',
                        difficulty: 'intermediate',
                        safetyLevel: 'medium',
                        certificationRequired: 'none',
                        estimatedProcedures: 15,
                        exampleProcedures: [
                            'Poda fruteiras',
                            'Poda seiva',
                            'Podaformação',
                        ],
                        tags: ['poda', 'árvore', 'arbusto', 'fruteira'],
                    },
                    {
                        id: 'rega',
                        name: 'Rega',
                        nameEn: 'Watering',
                        nameEs: 'Riego',
                        nameFr: 'Arrosage',
                        nameDe: 'Bewässerung',
                        description: 'Sistemas de rega e manutenção',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 10,
                        exampleProcedures: [
                            'Instalação rega automática',
                            'Manutenção aspersores',
                            'Calibração temporizador',
                        ],
                        tags: ['rega', 'aspersor', 'temporizador', 'automação'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 25,
            },
        ],
        safetyLevel: 'low',
        certificationRequired: 'none',
        marketSize: '€30B',
        targetAudience: ['Pais', 'Pessoas', 'Estudantes', 'Idosos'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. EDUCAÇÃO & FORMAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'educacao',
        name: 'Educação & Formação',
        nameEn: 'Education & Training',
        nameEs: 'Educación y Formación',
        nameFr: 'Éducation & Formation',
        nameDe: 'Bildung & Ausbildung',
        icon: '📚',
        description: 'Escolas, universidades, formação profissional',
        subcategories: [
            {
                id: 'formacao-profissional',
                name: 'Formação Profissional',
                nameEn: 'Vocational Training',
                nameEs: 'Formación Profesional',
                nameFr: 'Formation Professionnelle',
                nameDe: 'Berufsbildung',
                icon: '🎓',
                niches: [
                    {
                        id: 'eletronica',
                        name: 'Eletrónica',
                        nameEn: 'Electronics',
                        nameEs: 'Electrónica',
                        nameFr: 'Électronique',
                        nameDe: 'Elektronik',
                        description: 'Circuitos, soldadura SMD, medições',
                        difficulty: 'intermediate',
                        safetyLevel: 'medium',
                        certificationRequired: 'basic',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Soldadura SMD',
                            'Medição multímetro',
                            'Montagem PCB',
                            'Diagnóstico avarias',
                        ],
                        tags: ['eletrónica', 'PCB', 'soldadura', 'multímetro'],
                    },
                    {
                        id: 'informatica',
                        name: 'Informática',
                        nameEn: 'Computing',
                        nameEs: 'Informática',
                        nameFr: 'Informatique',
                        nameDe: 'Informatik',
                        description: 'Hardware, redes, programação',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'basic',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Montagem PC',
                            'Configuração redes',
                            'Instalação software',
                            'Diagnóstico avarias',
                        ],
                        tags: ['informática', 'PC', 'rede', 'software'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 90,
            },
            {
                id: 'educacao-basica',
                name: 'Educação Básica',
                nameEn: 'Basic Education',
                nameEs: 'Educación Básica',
                nameFr: 'Éducation Basique',
                nameDe: 'Grundbildung',
                icon: '🏫',
                niches: [
                    {
                        id: 'ciencias',
                        name: 'Ciências',
                        nameEn: 'Science',
                        nameEs: 'Ciencias',
                        nameFr: 'Sciences',
                        nameDe: 'Wissenschaften',
                        description: 'Experiências de ciências para crianças',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Experiência vulcão',
                            'Circuito elétrico simples',
                            'Plantação sementes',
                        ],
                        tags: ['ciências', 'experiência', 'escola', 'criança'],
                    },
                    {
                        id: 'artes',
                        name: 'Artes &动手',
                        nameEn: 'Arts & Crafts',
                        nameEs: 'Artes y Manualidades',
                        nameFr: 'Arts & Manuels',
                        nameDe: 'Kunst & Handwerk',
                        description: 'Atividades artesanais e criativas',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Pintura aquarela',
                            'Trabalho em argila',
                            'Colagem criativa',
                            'Origami',
                        ],
                        tags: ['artes', 'pintura', 'argila', 'criatividade'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 70,
            },
        ],
        safetyLevel: 'low',
        certificationRequired: 'none',
        marketSize: '€35B',
        targetAudience: ['Professores', 'Alunos', 'Formadores', 'Pais'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. DESPORTO & FITNESS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'desporto',
        name: 'Desporto & Fitness',
        nameEn: 'Sports & Fitness',
        nameEs: 'Deporte y Fitness',
        nameFr: 'Sport & Fitness',
        nameDe: 'Sport & Fitness',
        icon: '🏋️',
        description: 'Exercícios, artes marciais, dança, yoga',
        subcategories: [
            {
                id: 'fitness',
                name: 'Fitness',
                nameEn: 'Fitness',
                nameEs: 'Fitness',
                nameFr: 'Fitness',
                nameDe: 'Fitness',
                icon: '💪',
                niches: [
                    {
                        id: 'exercicios',
                        name: 'Exercícios',
                        nameEn: 'Exercises',
                        nameEs: 'Ejercicios',
                        nameFr: 'Exercices',
                        nameDe: 'Übungen',
                        description: 'Técnicas de exercícios de musculação e funcional',
                        difficulty: 'beginner',
                        safetyLevel: 'medium',
                        certificationRequired: 'none',
                        estimatedProcedures: 80,
                        exampleProcedures: [
                            'Agachamento',
                            'Supino',
                            'Puxada',
                            'Prancha',
                        ],
                        tags: ['exercício', 'musculação', 'funcional', 'treino'],
                    },
                    {
                        id: 'yoga',
                        name: 'Yoga',
                        nameEn: 'Yoga',
                        nameEs: 'Yoga',
                        nameFr: 'Yoga',
                        nameDe: 'Yoga',
                        description: 'Asanas, respiração, meditação',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 50,
                        exampleProcedures: [
                            'Saudação ao sol',
                            'Postura da cobra',
                            'Respiração alternada',
                        ],
                        tags: ['yoga', 'asana', 'respiração', 'meditação'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 130,
            },
            {
                id: 'artes-marciais',
                name: 'Artes Marciais',
                nameEn: 'Martial Arts',
                nameEs: 'Artes Marciales',
                nameFr: 'Arts Martiaux',
                nameDe: 'Kampfkünste',
                icon: '🥋',
                niches: [
                    {
                        id: 'kata',
                        name: 'Kata',
                        nameEn: 'Kata',
                        nameEs: 'Kata',
                        nameFr: 'Kata',
                        nameDe: 'Kata',
                        description: 'Formas tradicionais de artes marciais',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Heian Shodan',
                            'Tekki Shodan',
                            'Bassai Dai',
                        ],
                        tags: ['kata', 'karatê', 'formas', 'tradição'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 40,
            },
        ],
        safetyLevel: 'medium',
        certificationRequired: 'none',
        marketSize: '€20B',
        targetAudience: ['Pessoas', 'Atletas', 'Professores', 'Pais'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. SERVIÇOS PROFISSIONAIS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'servicos',
        name: 'Serviços Profissionais',
        nameEn: 'Professional Services',
        nameEs: 'Servicios Profesionales',
        nameFr: 'Services Professionnels',
        nameDe: 'Professionelle Dienstleistungen',
        icon: '💼',
        description: 'Cabeleireiro, barbeiro, manicure, costura',
        subcategories: [
            {
                id: 'beleza',
                name: 'Beleza & Cuidado Pessoal',
                nameEn: 'Beauty & Personal Care',
                nameEs: 'Belleza y Cuidado Personal',
                nameFr: 'Beauté & Soin Personnel',
                nameDe: 'Schönheit & Körperpflege',
                icon: '✂️',
                niches: [
                    {
                        id: 'cabelo',
                        name: 'Cabelo',
                        nameEn: 'Hair',
                        nameEs: 'Pelo',
                        nameFr: 'Cheveux',
                        nameDe: 'Haare',
                        description: 'Cortes, coloração, tratamento capilar',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'basic',
                        estimatedProcedures: 40,
                        exampleProcedures: [
                            'Corte feminino',
                            'Corte masculino',
                            'Coloração',
                            'Tratamento capilar',
                        ],
                        tags: ['cabelo', 'corte', 'coloração', 'tratamento'],
                    },
                    {
                        id: 'unhas',
                        name: 'Unhas',
                        nameEn: 'Nails',
                        nameEs: 'Uñas',
                        nameFr: 'Ongles',
                        nameDe: 'Nägel',
                        description: 'Manicure, pedicure, gel, acrílico',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'basic',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Manicure básica',
                            'Pedicure',
                            'Unhas em gel',
                            'Decoração unhas',
                        ],
                        tags: ['unhas', 'manicure', 'pedicure', 'gel'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 70,
            },
            {
                id: 'costura',
                name: 'Costura & Alfaiataria',
                nameEn: 'Sewing & Tailoring',
                nameEs: 'Costura y Sastrería',
                nameFr: 'Couture & Tailleur',
                nameDe: 'Nähen & Schneiderei',
                icon: '🧵',
                niches: [
                    {
                        id: 'costura-basica',
                        name: 'Costura Básica',
                        nameEn: 'Basic Sewing',
                        nameEs: 'Costura Básica',
                        nameFr: 'Couture Basique',
                        nameDe: 'Grundlegendes Nähen',
                        description: 'Reparos e costura manual/máquina',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 20,
                        exampleProcedures: [
                            'Reparar botão',
                            'Hemming',
                            'Costura máquina',
                        ],
                        tags: ['costura', 'botão', 'máquina', 'reparo'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 20,
            },
        ],
        safetyLevel: 'low',
        certificationRequired: 'basic',
        marketSize: '€20B',
        targetAudience: ['Profissionais', 'Pessoas', 'Empreendedores'],
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. TECNOLOGIA & INOVAÇÃO
    // ═══════════════════════════════════════════════════════════════════════════
    {
        id: 'tecnologia',
        name: 'Tecnologia & Inovação',
        nameEn: 'Technology & Innovation',
        nameEs: 'Tecnología e Innovación',
        nameFr: 'Technologie & Innovation',
        nameDe: 'Technologie & Innovation',
        icon: '💻',
        description: 'Eletrónica, TI, 3D, robótica, IA',
        subcategories: [
            {
                id: 'eletronica',
                name: 'Eletrónica',
                nameEn: 'Electronics',
                nameEs: 'Electrónica',
                nameFr: 'Électronique',
                nameDe: 'Elektronik',
                icon: '🔌',
                niches: [
                    {
                        id: 'soldadura-eletronica',
                        name: 'Soldadura Eletrónica',
                        nameEn: 'Electronic Soldering',
                        nameEs: 'Soldadura Electrónica',
                        nameFr: 'Soudure Électronique',
                        nameDe: 'Elektroniklöten',
                        description: 'Soldadura de componentes eletrónicos',
                        difficulty: 'intermediate',
                        safetyLevel: 'medium',
                        certificationRequired: 'basic',
                        estimatedProcedures: 25,
                        exampleProcedures: [
                            'Soldadura SMD',
                            'Soldadura THT',
                            'Rework PCB',
                            'Inspeção visual',
                        ],
                        tags: ['eletrónica', 'SMD', 'PCB', 'soldadura'],
                    },
                    {
                        id: 'raspberry-pi',
                        name: 'Raspberry Pi',
                        nameEn: 'Raspberry Pi',
                        nameEs: 'Raspberry Pi',
                        nameFr: 'Raspberry Pi',
                        nameDe: 'Raspberry Pi',
                        description: 'Programação e hardware Raspberry Pi',
                        difficulty: 'intermediate',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 30,
                        exampleProcedures: [
                            'Setup inicial',
                            'GPIO programming',
                            'Sensores',
                            'Projeto domótica',
                        ],
                        tags: ['Raspberry', 'GPIO', 'Arduino', 'IoT'],
                    },
                ],
                difficulty: 'intermediate',
                estimatedProcedures: 55,
            },
            {
                id: 'impressao-3d',
                name: 'Impressão 3D',
                nameEn: '3D Printing',
                nameEs: 'Impresión 3D',
                nameFr: 'Impression 3D',
                nameDe: '3D-Druck',
                icon: '🖨️',
                niches: [
                    {
                        id: 'fdm',
                        name: 'FDM',
                        nameEn: 'FDM',
                        nameEs: 'FDM',
                        nameFr: 'FDM',
                        nameDe: 'FDM',
                        description: 'Impressão 3D por extrusão',
                        difficulty: 'beginner',
                        safetyLevel: 'low',
                        certificationRequired: 'none',
                        estimatedProcedures: 20,
                        exampleProcedures: [
                            'Calibração bed',
                            'Troca filamento',
                            'Configurações impressão',
                            'Pós-processamento',
                        ],
                        tags: ['3D', 'FDM', 'filamento', 'impressão'],
                    },
                ],
                difficulty: 'beginner',
                estimatedProcedures: 20,
            },
        ],
        safetyLevel: 'low',
        certificationRequired: 'none',
        marketSize: '€60B',
        targetAudience: ['Makers', 'Estudantes', 'Profissionais', 'Hobbyistas'],
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all niches across all categories
 */
export function getAllNiches(): Niche[] {
    return CATEGORIES.flatMap(cat =>
        cat.subcategories.flatMap(sub => sub.niches)
    )
}

/**
 * Search niches by tag or text
 */
export function searchNiches(query: string): Niche[] {
    const lower = query.toLowerCase()
    return getAllNiches().filter(niche =>
        niche.name.toLowerCase().includes(lower) ||
        niche.nameEn.toLowerCase().includes(lower) ||
        niche.tags.some(tag => tag.includes(lower)) ||
        niche.exampleProcedures.some(proc => proc.toLowerCase().includes(lower))
    )
}

/**
 * Get niche by ID
 */
export function getNicheById(id: string): Niche | undefined {
    return getAllNiches().find(niche => niche.id === id)
}

/**
 * Get localized name for a niche
 */
export function getLocalizedName(niche: Niche, lang: 'pt' | 'en' | 'es' | 'fr' | 'de'): string {
    switch (lang) {
        case 'pt': return niche.name
        case 'en': return niche.nameEn
        case 'es': return niche.nameEs
        case 'fr': return niche.nameFr
        case 'de': return niche.nameDe
        default: return niche.name
    }
}

/**
 * Get categories count
 */
export function getStats(): {
    totalCategories: number
    totalSubcategories: number
    totalNiches: number
    totalProcedures: number
} {
    const totalCategories = CATEGORIES.length
    const totalSubcategories = CATEGORIES.reduce((sum, cat) => sum + cat.subcategories.length, 0)
    const totalNiches = getAllNiches().length
    const totalProcedures = getAllNiches().reduce((sum, niche) => sum + niche.estimatedProcedures, 0)

    return { totalCategories, totalSubcategories, totalNiches, totalProcedures }
}
