/**
 * @fileoverview Whisper API Integration
 * @description Automatic audio transcription using OpenAI Whisper API.
 *              Converts spoken narration into timestamped text segments
 *              for OKEM generation.
 *
 * Scientific basis:
 *   Whisper is a multi-lingual speech recognition model trained on
 *   680,000 hours of multilingual data. It provides word-level timestamps
 *   which are critical for aligning speech with kinematic phases.
 *
 * @version 1.0.0
 * @license Proprietary - Patent Pending
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface WhisperSegment {
    id: string
    seek: number
    start: number
    end: number
    text: string
    tokens: number[]
    temperature: number
    avg_logprob: number
    compression_ratio: number
    no_speech_prob: number
}

export interface WhisperWord {
    word: string
    start: number
    end: number
    probability: number
}

export interface TranscriptionResult {
    /** Full transcribed text */
    text: string
    /** Language detected */
    language: string
    /** Duration in seconds */
    duration: number
    /** Segments with timestamps */
    segments: WhisperSegment[]
    /** Words with precise timestamps */
    words: WhisperWord[]
    /** Confidence score [0, 1] */
    confidence: number
}

export interface TranscriptionConfig {
    /** Model to use (whisper-1) */
    model: string
    /** Language code (pt, en, es, fr, de) */
    language: string
    /** Response format (json, verbose_json, text, srt, vtt) */
    responseFormat: string
    /** Temperature (0-1, lower = more deterministic) */
    temperature: number
    /** Include timestamps */
    timestampGranularities: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: TranscriptionConfig = {
    model: 'whisper-1',
    language: 'pt',
    responseFormat: 'verbose_json',
    temperature: 0,
    timestampGranularities: ['word', 'segment'],
}

export const SUPPORTED_LANGUAGES: Record<string, string> = {
    pt: 'Portuguese',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    nl: 'Dutch',
    pl: 'Polish',
    ru: 'Russian',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    ar: 'Arabic',
    hi: 'Hindi',
    tr: 'Turkish',
    vi: 'Vietnamese',
    th: 'Thai',
    sv: 'Swedish',
    da: 'Danish',
    no: 'Norwegian',
    fi: 'Finnish',
}

// ─────────────────────────────────────────────────────────────────────────────
// WhisperTranscriber Class
// ─────────────────────────────────────────────────────────────────────────────

export class WhisperTranscriber {
    private config: TranscriptionConfig
    private apiKey: string

    constructor(apiKey: string, config: Partial<TranscriptionConfig> = {}) {
        this.apiKey = apiKey
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Transcribe audio from a Blob
     */
    async transcribeBlob(audioBlob: Blob): Promise<TranscriptionResult> {
        const formData = new FormData()
        formData.append('file', audioBlob, 'audio.webm')
        formData.append('model', this.config.model)
        formData.append('language', this.config.language)
        formData.append('response_format', this.config.responseFormat)
        formData.append('temperature', this.config.temperature.toString())
        formData.append('timestamp_granularities[]', this.config.timestampGranularities[0])

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Whisper API error: ${error.error?.message ?? 'Unknown error'}`)
        }

        const data = await response.json()
        return this.parseResponse(data)
    }

    /**
     * Transcribe audio from a File
     */
    async transcribeFile(audioFile: File): Promise<TranscriptionResult> {
        const formData = new FormData()
        formData.append('file', audioFile)
        formData.append('model', this.config.model)
        formData.append('language', this.config.language)
        formData.append('response_format', this.config.responseFormat)
        formData.append('temperature', this.config.temperature.toString())
        formData.append('timestamp_granularities[]', this.config.timestampGranularities[0])

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Whisper API error: ${error.error?.message ?? 'Unknown error'}`)
        }

        const data = await response.json()
        return this.parseResponse(data)
    }

    /**
     * Transcribe audio from a URL
     */
    async transcribeUrl(audioUrl: string): Promise<TranscriptionResult> {
        // Download audio
        const response = await fetch(audioUrl)
        const blob = await response.blob()
        return this.transcribeBlob(blob)
    }

    /**
     * Transcribe audio from ArrayBuffer
     */
    async transcribeBuffer(audioBuffer: ArrayBuffer): Promise<TranscriptionResult> {
        const blob = new Blob([audioBuffer], { type: 'audio/webm' })
        return this.transcribeBlob(blob)
    }

    /**
     * Parse Whisper API response
     */
    private parseResponse(data: {
        text?: string
        language?: string
        duration?: number
        segments?: WhisperSegment[]
        words?: WhisperWord[]
    }): TranscriptionResult {
        const text = data.text ?? ''
        const language = data.language ?? this.config.language
        const duration = data.duration ?? 0
        const segments = data.segments ?? []
        const words = data.words ?? []

        // Calculate confidence from segments
        const confidence = segments.length > 0
            ? segments.reduce((sum, seg) => sum + (1 - seg.no_speech_prob), 0) / segments.length
            : 0

        return {
            text,
            language,
            duration,
            segments,
            words,
            confidence,
        }
    }

    /**
     * Convert Whisper segments to AudioKinematic segments
     */
    toAudioSegments(result: TranscriptionResult): Array<{
        text: string
        startTimeMs: number
        endTimeMs: number
        confidence: number
    }> {
        return result.segments.map((seg, i) => ({
            id: `whisper_${i}`,
            text: seg.text.trim(),
            startTimeMs: seg.start * 1000,
            endTimeMs: seg.end * 1000,
            confidence: 1 - seg.no_speech_prob,
        }))
    }

    /**
     * Detect language from audio characteristics
     */
    async detectLanguage(audioBlob: Blob): Promise<string> {
        // Use a quick transcription to detect language
        const formData = new FormData()
        formData.append('file', audioBlob, 'audio.webm')
        formData.append('model', this.config.model)
        formData.append('response_format', 'json')

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: formData,
        })

        if (!response.ok) {
            return this.config.language // Fallback to configured language
        }

        const data = await response.json()
        return data.language ?? this.config.language
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-side API route for Whisper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API route handler for /api/transcribe
 * Receives audio blob, returns transcription
 */
export async function handleTranscription(
    audioBlob: Blob,
    apiKey: string,
    language = 'pt'
): Promise<TranscriptionResult> {
    const transcriber = new WhisperTranscriber(apiKey, { language })
    return transcriber.transcribeBlob(audioBlob)
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-side transcription using Web Speech API (fallback)
// ─────────────────────────────────────────────────────────────────────────────

export class WebSpeechTranscriber {
    private recognition: EventTarget | null = null
    private isRecording = false
    private segments: Array<{
        text: string
        startTimeMs: number
        endTimeMs: number
        confidence: number
    }> = []
    private startTime = 0

    /**
     * Start recording and transcribing
     */
    start(language = 'pt-PT'): void {
        if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
            throw new Error('Web Speech API not supported')
        }

        const SpeechRecognitionAPI = (window as unknown as { webkitSpeechRecognition: new () => EventTarget }).webkitSpeechRecognition
        this.recognition = new SpeechRecognitionAPI()
        const rec = this.recognition as unknown as Record<string, unknown>
        rec.continuous = true
        rec.interimResults = false
        rec.lang = language
        rec.onresult = (event: { results: Array<{ isFinal: boolean; length: number; item: (i: number) => { transcript: string; confidence: number } }> }) => {
            const result = event.results[event.results.length - 1]
            if (result.isFinal) {
                this.segments.push({
                    text: result.item(0).transcript,
                    startTimeMs: this.startTime,
                    endTimeMs: Date.now(),
                    confidence: result.item(0).confidence,
                })
                this.startTime = Date.now()
            }
        }

        this.startTime = Date.now()
        ;(rec.start as () => void)()
        this.isRecording = true
    }

    /**
     * Stop recording
     */
    stop(): void {
        if (this.recognition) {
            ;(this.recognition as unknown as { stop: () => void }).stop()
            this.isRecording = false
        }
    }

    /**
     * Get collected segments
     */
    getSegments(): Array<{
        text: string
        startTimeMs: number
        endTimeMs: number
        confidence: number
    }> {
        return [...this.segments]
    }

    /**
     * Clear collected segments
     */
    clear(): void {
        this.segments = []
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────────────────────

export const webSpeechTranscriber = new WebSpeechTranscriber()
