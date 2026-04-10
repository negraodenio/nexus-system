import OpenAI from 'openai'

// Client initialization moved inside function for runtime safety

export type ModelId = 'gpt-4o' | 'gemini-2-flash' | 'claude-3-5-sonnet' | 'deepseek-chat' | 'minimax-m2.7'

// Slugs verificados e válidos no OpenRouter (Abril 2026)
const MODELS: Record<ModelId, string> = {
    'gpt-4o':           'openai/gpt-4o',
    'gemini-2-flash':   'google/gemini-2.0-flash-001',
    'claude-3-5-sonnet':'anthropic/claude-3.5-sonnet',
    'deepseek-chat':    'deepseek/deepseek-chat',
    'minimax-m2.7':     'minimax/minimax-m2.7',
}

// Reads from env var to allow hot-swap without redeploy
const DEFAULT_TEXT_MODEL = process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.7'
// Vision-capable model for image analysis (Gemini Flash is free-tier & vision-native)
const VISION_MODEL = 'google/gemini-2.0-flash-001'

interface GenerateParams {
    concept: string
    audience: string
    model?: ModelId
    image?: string
    systemPrompt?: string
    preferredVisualType?: string
    ragContext?: string
}

export async function generateAnalogy({ concept, audience, model, image, systemPrompt, ragContext }: GenerateParams) {
    // HYBRID ROUTING: Use vision model when image is present (M2.7 is text-only)
    const hasImage = !!image
    const modelId = hasImage
        ? VISION_MODEL
        : (model ? (MODELS[model] || DEFAULT_TEXT_MODEL) : DEFAULT_TEXT_MODEL)

    console.log(`🤖 Model routing: hasImage=${hasImage} → using ${modelId}`)

    // Use provided system prompt or fallback to default
    let finalSystemPrompt = systemPrompt || `You are Nexus, a physical intelligence operating system. Your goal is to provide high-precision diagnoses, analogies, and technical guidance.
  
  Audience: ${audience}
  Concept: ${concept || (image ? 'Analisar imagem fornecida' : 'Desconhecido')}`

    // Inject RAG Context if available
    if (ragContext) {
        finalSystemPrompt += `
  
  --- RETRIEVED KNOWLEDGE (RAG) ---
  ${ragContext}
  ---------------------------------`
    }

    // Always append the Schema instruction to ensure JSON validity, regardless of the prompt source
    finalSystemPrompt += `
  
  Return a JSON object with the following structure:
  {
    "detected_mode": "The persona/mode you decided to use (e.g. 'Technician', 'Teacher', 'Detective', 'Zen')",
    "analogy": "The main analysis or explanation",
    "coreIdeas": ["Key point 1", "Key point 2", "Key point 3"],
    "limits": ["Important warnings", "Context limitations", "Verification notes"],
    "skill_query": "A short keyword phrase to search for a relevant skill demo (e.g., 'tighten screw', 'install hinge', 'apply glue'). Set to null if no physical skill demonstration is needed.",
    "visual": {
      "type": "mermaid" | "comparison" | "timeline" | "reality",
      "effect": "blur" | "grayscale" | null, // Optional effect for Zen mode
      "code": "mermaid graph code if type is mermaid",
      "items": [{"label": "Concept part", "value": "Analysis part"}] (if type is comparison),
      "steps": [{"title": "Step 1", "description": "What happens"}] (if type is timeline),
      "overlay": {
        "items": [
          {
            "label": "Part Name",
            "shape": "box" | "circle" | "arrow",
            "coordinates": [10, 20, 30, 40], // [x, y, width, height] in PERCENTAGE (0-100) of image
            "color": "#FF0000"
          }
        ]
      } (if type is reality)
    }
  }

  IMPORTANT RULE: If the user provided an image and the requested visual mode is 'reality' (or if you decide 'Technician'/'Detective' mode), you MUST return "type": "reality" and populate the "overlay" field.
  
  PHYSICAL SKILL RULE: If the task involves PHYSICAL MOTION (repair, assembly, cleaning, technique, gesture, crafting), you MUST populate "skill_query" with 2-4 keywords describing the action. Examples:
  - "How to tighten a screw?" -> skill_query: "tighten screw"
  - "How to apply wood glue?" -> skill_query: "apply glue"
  - "Show me a thumbs up" -> skill_query: "thumbs up gesture"
  - Abstract questions like "What is gravity?" -> skill_query: null
  
   3. DECIDER AGENT RULES (PRISMA MODE):
      - Broken item / Parts / How to fix? -> ACT AS "Technician" (Visual: Reality Overlay + Steps + skill_query)
      - Predictive / Diagnostic / Root Cause? -> ACT AS "Systems Engineer" (Visual: Mermaid Graph showing Flow: [Failure Probability] -> [Root Cause / Human Deviation] -> [Component] -> [Mitigation Skill])
      - Physical / AR Hardware issues (Lighing, Frame, Blur)? -> ACT AS "Auto-Debugger" (Visual: Reality Overlay pointing to sensor/lighting issues + Diagnostic Steps)
      - Learning / Concept / Question? -> ACT AS "Teacher" (Visual: Mermaid or Comparison)
      - News / Claim / Suspicious text? -> ACT AS "Detective" (Visual: Reality Overlay for visual cues)
      - Stress / Chaos / Overwhelm? -> ACT AS "Zen Guide" (Visual: Effect='blur', Analysis=Calming instructions)
   4. Fill "detected_mode" with your choice.
   5. Execute the persona's behavior for "analogy" and "visual" fields.

   AUTO-DEBUGGER SPECIAL RULES:
   If "detected_mode" is "Auto-Debugger":
   - Use the Image to identify lighting glare, camera angle issues, or occlusions.
   - Provide concrete steps to fix the PHYSICAL environment (e.g., "Rotate 20 degrees left", "Increase ambient lighting").
   - Populate "visual.type": "reality" to highlight the problematic area.

  HYBRID MODE: If you can identify a process (assembly, cleaning, repair), ALSO populate the "steps" array AND "skill_query". 

  Ensure the JSON is valid and strictly follows the schema.
  IMPORTANT: Return ONLY the JSON object. Do not add any markdown formatting, backticks, or conversational text. Start with { and end with }.
  
  LANGUAGE RULE: Detect the language of the user's message (e.g., Portuguese, English, Spanish). You MUST respond in the SAME language as the user's message. If the user asks in Portuguese, the "analogy", "coreIdeas", "limits", "items", "steps", and "overlay" labels MUST be in Portuguese.`

    try {
        const rawKey = process.env.OPENROUTER_API_KEY
        const apiKey = rawKey?.trim()

        console.log('🔑 AI Client - Key Status:', {
            found: !!rawKey,
            length: rawKey?.length,
            trimmedLength: apiKey?.length,
            preview: apiKey ? `${apiKey.substring(0, 7)}...` : 'MISSING'
        })

        if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing in environment variables')

        const openRouter = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
            defaultHeaders: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'Nexus Cognitive Adapter',
            },
        })

        // OpenAI e Gemini suportam json_object natively; Claude e DeepSeek preferem system prompt
        const supportsJsonMode = modelId.startsWith('openai/') || modelId.startsWith('google/')

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: finalSystemPrompt },
            {
                role: 'user',
                content: image
                    ? [
                        { type: 'text', text: `Explain "${concept}" to a "${audience}"` },
                        { type: 'image_url', image_url: { url: image } }
                    ]
                    : `Explain "${concept}" to a "${audience}"`
            } as OpenAI.Chat.Completions.ChatCompletionMessageParam
        ]

        const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
            model: modelId,
            messages,
            max_tokens: 4096,
            temperature: 0.5,
        }

        if (supportsJsonMode) {
            params.response_format = { type: 'json_object' }
        }

        try {
            const completion = await openRouter.chat.completions.create(params)

            const choice = completion.choices?.[0]
            if (!choice || !choice.message) {
                throw new Error(`Invalid API response: ${JSON.stringify(completion)}`)
            }
            const content = choice.message.content
            if (!content) throw new Error('No content received')

            // Robust JSON extraction
            const startIndex = content.indexOf('{')
            const endIndex = content.lastIndexOf('}')

            if (startIndex === -1 || endIndex === -1) {
                console.error("JSON Parse Error. Raw content:", content)
                throw new Error('No valid JSON found in response')
            }

            const jsonString = content.substring(startIndex, endIndex + 1)
            return JSON.parse(jsonString)

        } catch (error: unknown) {
            // Enhanced Error Logging for Mobile Debugging
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiError = error as any // Practical cast for checking properties safely
            console.error("--------- AI API ERROR ---------")
            console.error("Status:", apiError?.status)
            console.error("Message:", apiError?.message)
            console.error("Type:", apiError?.type)
            console.error("Full Error Object:", JSON.stringify(apiError, null, 2))

            if (apiError?.status === 400) {
                throw new Error(`Provider returned 400 (Bad Request). This usually means the Image is too large or the Model ID is invalid. Model: ${modelId}`)
            }
            throw error
        }
    } catch (error) {
        console.error('Error generating analogy:', error)
        throw error
    }
}

export async function generateEmbedding(text: string) {
    try {
        // Using OpenAI directly for embeddings if key is available, or OpenRouter if they support it.
        // Ideally we should use text-embedding-3-small via OpenAI or similar.
        // For this MVP, if OPENROUTER_API_KEY is used for OpenAI models, it might work, 
        // but OpenRouter strictly for chat. 
        // We will return null for now if we can't reliably generate embeddings without a specific key.

        // If user has OpenAI key in env, use it.
        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            })
            return embedding.data[0].embedding
        }

        return null
    } catch (error) {
        console.error('Error generating embedding:', error)
        return null
    }
}

export async function predictMotion(currentLandmarks: any[], ragContext: string) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY?.trim()
        if (!apiKey) return null

        const openRouter = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
        })

        const systemPrompt = `You are a Neuromuscular Prediction Engine. Your goal is to predict hand landmarks for T+200ms.
        - Analyze the CURRENT landmarks provided.
        - Use the RAG context (similar muscle patterns and motions) to infer the next state.
        - Return ONLY a JSON object with:
          {
            "predictedLandmarks": [{"x": number, "y": number, "z": number, "visibility": number}], // Array of 21 landmarks
            "confidence": 0-1,
            "reasoning": "Short technical reason for prediction"
          }
        - IMPORTANT: Return ONLY the JSON object. No markdown.`

        const content = `Current Landmarks: ${JSON.stringify(currentLandmarks)}
        RAG Context: ${ragContext}`

        const completion = await openRouter.chat.completions.create({
            model: process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.7',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        })

        const responseContent = completion.choices[0].message.content
        if (!responseContent) return null
        
        const result = JSON.parse(responseContent)
        return result
    } catch (error) {
        console.error('Error predicting motion:', error)
        return null
    }
}
