import { withSecurity } from '@/lib/security'
import OpenAI from 'openai'

export const POST = withSecurity(async ({ ctx, body }) => {
    const { prompt, companyId } = body

    if (!prompt) {
        throw new Error('Missing prompt')
    }

    const apiKey = process.env.OPENROUTER_API_KEY?.trim()
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing')

    const openRouter = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
    })

    // =========================================================
    // STEP 1 — Retrieval (Motion Fragment RAG)
    // =========================================================
    // Optional: Retrieve similar fragments from database to seed the generation
    // For this phase, we use the M2.7 internal knowledge of biomechanics.

    // =========================================================
    // STEP 2 — Generation via MiniMax M2.7 (Motion Architect)
    // =========================================================
    const systemPrompt = `You are a Biomechanical Motion Architect.
    Your goal is to convert a text description of a hand movement into a detailed "Kinematic Recipe".
    - The recipe should be a sequence of control parameters for a parametric hand model.
    - Return ONLY a JSON object with this exact structure:
      {
        "skillName": "Text name of the skill",
        "duration": number (total frames, use 30-150),
        "basePosition": { "x": number, "y": number, "z": number },
        "rotation": { "pitch": number, "yaw": number, "roll": number },
        "fingers": [
            { "thumb": 0-1, "index": 0-1, "middle": 0-1, "ring": 0-1, "pinky": 0-1 }
        ], 
        "reasoning": "Technical explanation of the movement"
      }
    - Important: The 'fingers' array MUST have exactly 'duration' elements. 
    - Positions should be centered around (0.5, 0.5, 0).
    - Flexion: 0.0 is open, 1.0 is fully curled.`

    const completion = await openRouter.chat.completions.create({
        model: process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.7',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt as string }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
    })

    const responseContent = completion.choices[0].message.content
    if (!responseContent) throw new Error('Empty response from AI')

    const recipe = JSON.parse(responseContent)

    return {
        source: 'motion-gpt',
        recipe
    }
})