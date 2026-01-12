import { useState } from 'react'
import { Search, Loader2, Play, Sparkles } from 'lucide-react'
import { getApiUrl } from '@/lib/api-config'

// Interface definitions
interface SearchResult {
    id: string
    skill_id?: string
    title: string
    description?: string
    similarity: number
    tags?: string[]
    video_url?: string
}

interface SkillSearchProps {
    onSelectSkill?: (skillId: string) => void
}
export function SkillSearch({ onSelectSkill }: SkillSearchProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async () => {
        if (!query.trim()) return

        setLoading(true)
        setSearched(true)

        try {
            const response = await fetch(getApiUrl('/api/skills/semantic-search'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            })

            const data = await response.json()
            setResults(data.results || [])
        } catch (error) {
            console.error('Search error:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Ex: como apertar parafuso, como dar nó..."
                        className="w-full pl-10 pr-4 py-3 bg-[#151c26] border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}
                    Buscar
                </button>
            </div>

            {/* Results */}
            {searched && (
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            Buscando skills similares...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            Nenhuma skill encontrada para &quot;{query}&quot;
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-slate-400">
                                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                            </p>
                            {results.map((result) => (
                                <div
                                    key={result.skill_id || result.id}
                                    className="p-4 bg-[#1c242f] rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group"
                                    onClick={() => onSelectSkill?.(result.skill_id || result.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                {result.title}
                                            </h3>
                                            {result.description && (
                                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                                    {result.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                                    {Math.round(result.similarity * 100)}% similar
                                                </span>
                                                {result.video_url && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                                        📹 Com vídeo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="p-2 bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
