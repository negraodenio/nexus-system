import OpenAI from 'openai'

// Client initialization moved inside function for runtime safety

export type ModelId = 'gpt-5.2-pro' | 'gemini-3-pro' | 'claude-opus-4.5' | 'deepseek-v3.2'

const MODELS: Record<ModelId, string> = {
    'gpt-5.2-pro': 'openai/gpt-5.2-pro',
    'gemini-3-pro': 'google/gemini-3-pro-preview',
    'claude-opus-4.5': 'anthropic/claude-opus-4.5',
    'deepseek-v3.2': 'deepseek/deepseek-v3.2',
}

interface GenerateParams {
    concept: string
    audience: string
    model?: ModelId
    image?: string
    systemPrompt?: string
    preferredVisualType?: string
}

export async function generateAnalogy({ concept, audience, model = 'gpt-5.2-pro', image, systemPrompt }: GenerateParams) {
    const modelId = MODELS[model] || MODELS['gpt-5.2-pro']

    // Use provided system prompt or fallback to default
    let finalSystemPrompt = systemPrompt || `You are Nexus, a cognitive adapter. Your goal is to explain complex concepts using analogies tailored to a specific audience.
  
  Audience: ${audience}
  Concept: ${concept || (image ? 'Analyze the image provided' : 'Unknown')}`

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
  
  DECIDER AGENT RULES (PRISMA MODE):
  1. Analyze the input (Image + Text).
  2. Determine the user's INTENT:
     - Broken item / Parts / How to fix? -> ACT AS "Technician" (Visual: Reality Overlay + Steps + skill_query)
     - Learning / Concept / Question? -> ACT AS "Teacher" (Visual: Mermaid or Comparison)
     - News / Claim / Suspicious text? -> ACT AS "Detective" (Visual: Reality Overlay for visual cues)
     - Stress / Chaos / Overwhelm? -> ACT AS "Zen Guide" (Visual: Effect='blur', Analysis=Calming instructions)
  3. Fill "detected_mode" with your choice.
  4. Execute the persona's behavior for "analogy" and "visual" fields.

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

        const isOpenAI = modelId.startsWith('gpt') || modelId.startsWith('openai')

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = image && !isOpenAI
            ? [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `${finalSystemPrompt}\n\nTask: Explain "${concept}" to a "${audience}"` },
                        { type: 'image_url', image_url: { url: image } }
                    ]
                }
            ]
            : [
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
            max_tokens: 4096, // Increased buffer, but still limited to prevent runaway costs
            temperature: 0.5 // Lower temperature for more deterministic coordinate output
        }

        if (isOpenAI || modelId.includes('gemini') || modelId.includes('claude-3-opus')) {
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
