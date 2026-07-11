import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { ProductType } from '../types';

interface AIConcept {
  slogan: string;
  subtext: string;
  font: string;
  color: string;
  fabricColor: string;
  graphicSuggestion: string;
  explanation: string;
}

interface AIPromptHelperProps {
  productType: ProductType;
  onApplyConcept: (concept: AIConcept) => void;
}

export default function AIPromptHelper({ productType, onApplyConcept }: AIPromptHelperProps) {
  const [vibe, setVibe] = useState('');
  const [loading, setLoading] = useState(false);
  const [concepts, setConcepts] = useState<AIConcept[]>([]);
  const [error, setError] = useState('');

  const generateIdeas = async () => {
    if (!vibe.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe, productType })
      });
      if (!response.ok) throw new Error('Failed to fetch from Gemini API');
      const data = await response.json();
      setConcepts(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de se connecter au serveur de design. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const quickVibes = [
    'Y2K Cyber Chrome',
    'Nothing Tech Minimalist',
    'MSCHF Brutalist Rebellion',
    'Nike Premium Sportswear',
    'Tokyo Street Graffiti'
  ];

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-red animate-pulse" />
        <h3 className="font-display font-bold text-base tracking-tight text-white uppercase">
          Studio d'Idées Gemini AI
        </h3>
      </div>

      <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
        Laissez l'intelligence de DjassaClub concevoir votre prochaine pièce. Décrivez l'ambiance désirée :
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
          placeholder="Ex: Futuriste liquide, rebelle de rue..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-red/60 focus:ring-1 focus:ring-brand-red/60"
          onKeyDown={(e) => { if (e.key === 'Enter') generateIdeas(); }}
        />
        <button
          onClick={generateIdeas}
          disabled={loading || !vibe.trim()}
          className="bg-brand-red hover:bg-brand-red/90 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Générer
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Quick selection tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {quickVibes.map((qVibe) => (
          <button
            key={qVibe}
            onClick={() => { setVibe(qVibe); }}
            className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${
              vibe === qVibe 
                ? 'bg-brand-red/10 border-brand-red text-brand-red' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {qVibe}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-[11px] text-brand-red mb-4 bg-brand-red/5 p-2 rounded border border-brand-red/20 font-bold">
          {error}
        </div>
      )}

      {concepts.length > 0 && (
        <div className="space-y-3 mt-4 border-t border-zinc-800/60 pt-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
            Concepts Proposés :
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {concepts.map((concept, index) => (
              <div 
                key={index} 
                onClick={() => onApplyConcept(concept)}
                className="group cursor-pointer bg-zinc-900/60 border border-zinc-800 hover:border-brand-red/50 rounded-lg p-3 transition-all hover:bg-zinc-900"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-display font-bold text-white group-hover:text-brand-red transition-colors">
                    {concept.slogan}
                  </span>
                  <span className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded group-hover:bg-brand-red/10 group-hover:text-brand-red transition-colors">
                    Concept {index + 1}
                  </span>
                </div>
                {concept.subtext && (
                  <div className="text-[9px] font-bold text-zinc-500 truncate mb-1">
                    {concept.subtext}
                  </div>
                )}
                <div className="text-[10px] text-zinc-400 leading-normal mb-2">
                  {concept.explanation}
                </div>
                <div className="flex flex-wrap gap-2 items-center text-[9px] font-bold text-zinc-500 pt-1 border-t border-zinc-800/40">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: concept.fabricColor }} />
                    Base: {concept.fabricColor}
                  </span>
                  <span>•</span>
                  <span>Impression: {concept.color}</span>
                  <span>•</span>
                  <span>Style: {concept.font}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
