/**
 * @fileoverview Multi-Language Support System
 * @description Supports 5 languages for global scale:
 *              - Portuguese (PT) - Primary market
 *              - English (EN) - Global market
 *              - Spanish (ES) - Latin America + Spain
 *              - French (FR) - France + Africa
 *              - German (DE) - Germany + DACH region
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de'

export interface Translation {
    [key: string]: string | Translation
}

export interface LocalizedString {
    pt: string
    en: string
    es: string
    fr: string
    de: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────

export const TRANSLATIONS: Record<Language, Translation> = {
    // ═══════════════════════════════════════════════════════════════════════════
    // PORTUGUESE
    // ═══════════════════════════════════════════════════════════════════════════
    pt: {
        // Navigation
        nav: {
            home: 'Início',
            record: 'Gravar',
            learn: 'Aprender',
            explore: 'Explorar',
            dashboard: 'Painel',
            settings: 'Configurações',
        },

        // Record Page
        record: {
            title: 'Gravar Procedimento',
            subtitle: 'Fale enquanto executa. O sistema aprende automaticamente.',
            procedureName: 'Nome do Procedimento',
            procedureNamePlaceholder: 'Ex: Troca de lâmpada do carro',
            specialistName: 'Seu Nome',
            specialistNamePlaceholder: 'Ex: Pai do João',
            startRecording: 'Gravar',
            stopRecording: 'Parar',
            recording: 'Gravando...',
            sentencesCaptured: 'frases capturadas',
            processing: 'Processando gravação...',
            success: 'Procedimento Gravado!',
            stepsExtracted: 'Passos Extraídos',
            confidence: 'Confiança',
            recordAgain: 'Gravar Novamente',
            copyId: 'Copiar ID',
        },

        // Learn Page
        learn: {
            title: 'Aprender Procedimento',
            subtitle: 'Siga as instruções. O sistema valida em tempo real.',
            okemId: 'OKEM ID',
            okemIdPlaceholder: 'Cole o ID do procedimento',
            startLearning: 'Começar Aprendizagem',
            step: 'Passo',
            of: 'de',
            critical: 'CRÍTICO',
            repeat: 'Repetir',
            confirmStep: 'Confirmar Passo',
            stop: 'Parar',
            completed: 'Procedimento Concluído!',
            congratulations: 'Parabéns! Você completou todos os passos com sucesso.',
            finalScore: 'Score Final',
            learnAnother: 'Aprender Outro Procedimento',
            score: 'Score',
            tryAgain: 'Tente novamente',
        },

        // Common
        common: {
            loading: 'Carregando...',
            error: 'Erro',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            search: 'Pesquisar',
            filter: 'Filtrar',
            sort: 'Ordenar',
            export: 'Exportar',
            import: 'Importar',
            share: 'Partilhar',
            download: 'Descarregar',
            upload: 'Carregar',
            close: 'Fechar',
            back: 'Voltar',
            next: 'Próximo',
            previous: 'Anterior',
            confirm: 'Confirmar',
            yes: 'Sim',
            no: 'Não',
        },

        // Categories
        categories: {
            industria: 'Indústria & Manutenção',
            construcao: 'Construção & Ofícios',
            saude: 'Saúde & Bem-Estar',
            alimentacao: 'Alimentação & Bebidas',
            educacao: 'Educação & Formação',
            casa: 'Casa & DIY',
            desporto: 'Desporto & Fitness',
            servicos: 'Serviços Profissionais',
            tecnologia: 'Tecnologia & Inovação',
        },

        // Difficulty Levels
        difficulty: {
            beginner: 'Iniciante',
            intermediate: 'Intermediário',
            advanced: 'Avançado',
            expert: 'Especialista',
        },

        // Safety Levels
        safety: {
            low: 'Baixo',
            medium: 'Médio',
            high: 'Alto',
            critical: 'Crítico',
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ENGLISH
    // ═══════════════════════════════════════════════════════════════════════════
    en: {
        nav: {
            home: 'Home',
            record: 'Record',
            learn: 'Learn',
            explore: 'Explore',
            dashboard: 'Dashboard',
            settings: 'Settings',
        },
        record: {
            title: 'Record Procedure',
            subtitle: 'Speak while performing. The system learns automatically.',
            procedureName: 'Procedure Name',
            procedureNamePlaceholder: 'e.g., Car light bulb replacement',
            specialistName: 'Your Name',
            specialistNamePlaceholder: "e.g., John's Dad",
            startRecording: 'Record',
            stopRecording: 'Stop',
            recording: 'Recording...',
            sentencesCaptured: 'sentences captured',
            processing: 'Processing recording...',
            success: 'Procedure Recorded!',
            stepsExtracted: 'Steps Extracted',
            confidence: 'Confidence',
            recordAgain: 'Record Again',
            copyId: 'Copy ID',
        },
        learn: {
            title: 'Learn Procedure',
            subtitle: 'Follow the instructions. The system validates in real-time.',
            okemId: 'OKEM ID',
            okemIdPlaceholder: 'Paste the procedure ID',
            startLearning: 'Start Learning',
            step: 'Step',
            of: 'of',
            critical: 'CRITICAL',
            repeat: 'Repeat',
            confirmStep: 'Confirm Step',
            stop: 'Stop',
            completed: 'Procedure Completed!',
            congratulations: 'Congratulations! You completed all steps successfully.',
            finalScore: 'Final Score',
            learnAnother: 'Learn Another Procedure',
            score: 'Score',
            tryAgain: 'Try again',
        },
        common: {
            loading: 'Loading...',
            error: 'Error',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            filter: 'Filter',
            sort: 'Sort',
            export: 'Export',
            import: 'Import',
            share: 'Share',
            download: 'Download',
            upload: 'Upload',
            close: 'Close',
            back: 'Back',
            next: 'Next',
            previous: 'Previous',
            confirm: 'Confirm',
            yes: 'Yes',
            no: 'No',
        },
        categories: {
            industria: 'Industry & Maintenance',
            construcao: 'Construction & Trades',
            saude: 'Health & Wellness',
            alimentacao: 'Food & Beverage',
            educacao: 'Education & Training',
            casa: 'Home & DIY',
            desporto: 'Sports & Fitness',
            servicos: 'Professional Services',
            tecnologia: 'Technology & Innovation',
        },
        difficulty: {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced',
            expert: 'Expert',
        },
        safety: {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            critical: 'Critical',
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SPANISH
    // ═══════════════════════════════════════════════════════════════════════════
    es: {
        nav: {
            home: 'Inicio',
            record: 'Grabar',
            learn: 'Aprender',
            explore: 'Explorar',
            dashboard: 'Panel',
            settings: 'Configuración',
        },
        record: {
            title: 'Grabar Procedimiento',
            subtitle: 'Hable mientras ejecuta. El sistema aprende automáticamente.',
            procedureName: 'Nombre del Procedimiento',
            procedureNamePlaceholder: 'Ej: Cambio de bombilla del coche',
            specialistName: 'Su Nombre',
            specialistNamePlaceholder: 'Ej: Padre de Juan',
            startRecording: 'Grabar',
            stopRecording: 'Parar',
            recording: 'Grabando...',
            sentencesCaptured: 'frases capturadas',
            processing: 'Procesando grabación...',
            success: '¡Procedimiento Grabado!',
            stepsExtracted: 'Pasos Extraídos',
            confidence: 'Confianza',
            recordAgain: 'Grabar de Nuevo',
            copyId: 'Copiar ID',
        },
        learn: {
            title: 'Aprender Procedimiento',
            subtitle: 'Siga las instrucciones. El sistema valida en tiempo real.',
            okemId: 'ID OKEM',
            okemIdPlaceholder: 'Pegue el ID del procedimiento',
            startLearning: 'Comenzar Aprendizaje',
            step: 'Paso',
            of: 'de',
            critical: 'CRÍTICO',
            repeat: 'Repetir',
            confirmStep: 'Confirmar Paso',
            stop: 'Parar',
            completed: '¡Procedimiento Completado!',
            congratulations: '¡Felicidades! Completó todos los pasos con éxito.',
            finalScore: 'Puntuación Final',
            learnAnother: 'Aprender Otro Procedimiento',
            score: 'Puntuación',
            tryAgain: 'Intente de nuevo',
        },
        common: {
            loading: 'Cargando...',
            error: 'Error',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            search: 'Buscar',
            filter: 'Filtrar',
            sort: 'Ordenar',
            export: 'Exportar',
            import: 'Importar',
            share: 'Compartir',
            download: 'Descargar',
            upload: 'Subir',
            close: 'Cerrar',
            back: 'Volver',
            next: 'Siguiente',
            previous: 'Anterior',
            confirm: 'Confirmar',
            yes: 'Sí',
            no: 'No',
        },
        categories: {
            industria: 'Industria y Mantenimiento',
            construcao: 'Construcción y Oficios',
            saude: 'Salud y Bienestar',
            alimentacao: 'Alimentación y Bebidas',
            educacao: 'Educación y Formación',
            casa: 'Hogar y Bricolaje',
            desporto: 'Deporte y Fitness',
            servicos: 'Servicios Profesionales',
            tecnologia: 'Tecnología e Innovación',
        },
        difficulty: {
            beginner: 'Principiante',
            intermediate: 'Intermedio',
            advanced: 'Avanzado',
            expert: 'Experto',
        },
        safety: {
            low: 'Bajo',
            medium: 'Medio',
            high: 'Alto',
            critical: 'Crítico',
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // FRENCH
    // ═══════════════════════════════════════════════════════════════════════════
    fr: {
        nav: {
            home: 'Accueil',
            record: 'Enregistrer',
            learn: 'Apprendre',
            explore: 'Explorer',
            dashboard: 'Tableau de bord',
            settings: 'Paramètres',
        },
        record: {
            title: 'Enregistrer une Procédure',
            subtitle: 'Parlez en exécutant. Le système apprend automatiquement.',
            procedureName: 'Nom de la Procédure',
            procedureNamePlaceholder: 'Ex: Remplacement ampoule voiture',
            specialistName: 'Votre Nom',
            specialistNamePlaceholder: 'Ex: Père de Jean',
            startRecording: 'Enregistrer',
            stopRecording: 'Arrêter',
            recording: 'Enregistrement...',
            sentencesCaptured: 'phrases capturées',
            processing: 'Traitement enregistrement...',
            success: 'Procédure Enregistrée!',
            stepsExtracted: 'Étapes Extraites',
            confidence: 'Confiance',
            recordAgain: 'Enregistrer Encore',
            copyId: 'Copier ID',
        },
        learn: {
            title: 'Apprendre une Procédure',
            subtitle: 'Suivez les instructions. Le système valide en temps réel.',
            okemId: 'ID OKEM',
            okemIdPlaceholder: "Collez l'ID de la procédure",
            startLearning: 'Commencer Apprentissage',
            step: 'Étape',
            of: 'sur',
            critical: 'CRITIQUE',
            repeat: 'Répéter',
            confirmStep: "Confirmer l'Étape",
            stop: 'Arrêter',
            completed: 'Procédure Terminée!',
            congratulations: 'Félicitations! Vous avez terminé toutes les étapes avec succès.',
            finalScore: 'Score Final',
            learnAnother: 'Apprendre Autre Procédure',
            score: 'Score',
            tryAgain: 'Réessayez',
        },
        common: {
            loading: 'Chargement...',
            error: 'Erreur',
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer',
            edit: 'Modifier',
            search: 'Rechercher',
            filter: 'Filtrer',
            sort: 'Trier',
            export: 'Exporter',
            import: 'Importer',
            share: 'Partager',
            download: 'Télécharger',
            upload: 'Téléverser',
            close: 'Fermer',
            back: 'Retour',
            next: 'Suivant',
            previous: 'Précédent',
            confirm: 'Confirmer',
            yes: 'Oui',
            no: 'Non',
        },
        categories: {
            industria: 'Industrie & Maintenance',
            construcao: 'Construction & Métiers',
            saude: 'Santé & Bien-être',
            alimentacao: 'Alimentation & Boissons',
            educacao: 'Éducation & Formation',
            casa: 'Maison & Bricolage',
            desporto: 'Sport & Fitness',
            servicos: 'Services Professionnels',
            tecnologia: 'Technologie & Innovation',
        },
        difficulty: {
            beginner: 'Débutant',
            intermediate: 'Intermédiaire',
            advanced: 'Avancé',
            expert: 'Expert',
        },
        safety: {
            low: 'Faible',
            medium: 'Moyen',
            high: 'Élevé',
            critical: 'Critique',
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // GERMAN
    // ═══════════════════════════════════════════════════════════════════════════
    de: {
        nav: {
            home: 'Startseite',
            record: 'Aufnehmen',
            learn: 'Lernen',
            explore: 'Erkunden',
            dashboard: 'Dashboard',
            settings: 'Einstellungen',
        },
        record: {
            title: 'Verfahren Aufnehmen',
            subtitle: 'Sprechen Sie während der Ausführung. Das System lernt automatisch.',
            procedureName: 'Verfahrensname',
            procedureNamePlaceholder: 'z.B. Autolichtbirne wechseln',
            specialistName: 'Ihr Name',
            specialistNamePlaceholder: 'z.B. Vater von Hans',
            startRecording: 'Aufnehmen',
            stopRecording: 'Stoppen',
            recording: 'Aufnahme...',
            sentencesCaptured: 'Sätze erfasst',
            processing: 'Aufnahme wird verarbeitet...',
            success: 'Verfahren Aufgenommen!',
            stepsExtracted: 'Schritte Extrahiert',
            confidence: 'Vertrauen',
            recordAgain: 'Erneut Aufnehmen',
            copyId: 'ID Kopieren',
        },
        learn: {
            title: 'Verfahren Lernen',
            subtitle: 'Folgen Sie den Anweisungen. Das System validiert in Echtzeit.',
            okemId: 'OKEM-ID',
            okemIdPlaceholder: 'Fügen Sie die Verfahrens-ID ein',
            startLearning: 'Lernen Beginnen',
            step: 'Schritt',
            of: 'von',
            critical: 'KRITISCH',
            repeat: 'Wiederholen',
            confirmStep: 'Schritt Bestätigen',
            stop: 'Stoppen',
            completed: 'Verfahren Abgeschlossen!',
            congratulations: 'Herzlichen Glückwunsch! Sie haben alle Schritte erfolgreich abgeschlossen.',
            finalScore: 'Endergebnis',
            learnAnother: 'Anderes Verfahren Lernen',
            score: 'Ergebnis',
            tryAgain: 'Versuchen Sie es erneut',
        },
        common: {
            loading: 'Laden...',
            error: 'Fehler',
            save: 'Speichern',
            cancel: 'Abbrechen',
            delete: 'Löschen',
            edit: 'Bearbeiten',
            search: 'Suchen',
            filter: 'Filtern',
            sort: 'Sortieren',
            export: 'Exportieren',
            import: 'Importieren',
            share: 'Teilen',
            download: 'Herunterladen',
            upload: 'Hochladen',
            close: 'Schließen',
            back: 'Zurück',
            next: 'Weiter',
            previous: 'Zurück',
            confirm: 'Bestätigen',
            yes: 'Ja',
            no: 'Nein',
        },
        categories: {
            industria: 'Industrie & Wartung',
            construcao: 'Bauhandwerk',
            saude: 'Gesundheit & Wellness',
            alimentacao: 'Lebensmittel & Getränke',
            educacao: 'Bildung & Ausbildung',
            casa: 'Haus & Heimwerker',
            desporto: 'Sport & Fitness',
            servicos: 'Professionelle Dienstleistungen',
            tecnologia: 'Technologie & Innovation',
        },
        difficulty: {
            beginner: 'Anfänger',
            intermediate: 'Mittel',
            advanced: 'Fortgeschritten',
            expert: 'Experte',
        },
        safety: {
            low: 'Niedrig',
            medium: 'Mittel',
            high: 'Hoch',
            critical: 'Kritisch',
        },
    },
}

// ─────────────────────────────────────────────────────────────────────────────
// Localization Class
// ─────────────────────────────────────────────────────────────────────────────

export class Localization {
    private currentLanguage: Language = 'pt'

    /**
     * Set current language
     */
    setLanguage(lang: Language): void {
        this.currentLanguage = lang
    }

    /**
     * Get current language
     */
    getLanguage(): Language {
        return this.currentLanguage
    }

    /**
     * Get translation by key path
     * Example: t('record.title')
     */
    t(key: string): string {
        const keys = key.split('.')
        let value: string | Translation | undefined = TRANSLATIONS[this.currentLanguage]

        for (const k of keys) {
            if (typeof value === 'object' && value !== null) {
                value = value[k]
            } else {
                return key
            }
        }

        return typeof value === 'string' ? value : key
    }

    /**
     * Get localized string for a LocalizedString object
     */
    localize(obj: LocalizedString): string {
        return obj[this.currentLanguage] || obj.en || obj.pt
    }

    /**
     * Detect browser language
     */
    detectBrowserLanguage(): Language {
        if (typeof window === 'undefined') return 'pt'

        const browserLang = navigator.language.split('-')[0]
        if (browserLang in TRANSLATIONS) {
            return browserLang as Language
        }

        return 'pt'
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages(): Array<{ code: Language; name: string }> {
        return [
            { code: 'pt', name: 'Português' },
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'de', name: 'Deutsch' },
        ]
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const localization = new Localization()
