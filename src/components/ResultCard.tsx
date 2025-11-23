import React from 'react';
import type { IdentificationResult } from '../services/gemini';
import { Plus, X, DollarSign } from 'lucide-react';

interface ResultCardProps {
    result: IdentificationResult;
    capturedImage: string;
    onAddToCrew: () => void;
    onClose: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, capturedImage, onAddToCrew, onClose }) => {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-sea border-2 border-pirate-gold rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="bg-pirate-gold/10 p-4 border-b border-pirate-gold/30 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-pirate-gold tracking-wide">Card Identified!</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    {/* Images */}
                    <div className="flex gap-4 justify-center">
                        <div className="w-1/2 aspect-[2.5/3.5] relative rounded-lg overflow-hidden border border-white/20 shadow-lg group">
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-white font-medium">Captured</span>
                            </div>
                        </div>
                        <div className="w-1/2 aspect-[2.5/3.5] relative rounded-lg overflow-hidden border border-pirate-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <img
                                src={result.image}
                                alt={result.name}
                                className="w-full h-full object-contain bg-black/40"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = capturedImage; // Fallback
                                }}
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-white leading-tight">{result.name}</h3>
                                <p className="text-ocean-blue font-medium">{result.set} • {result.code}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="bg-pirate-gold/20 text-pirate-gold px-2 py-0.5 rounded text-xs font-bold border border-pirate-gold/30">
                                    {result.rarity}
                                </span>
                            </div>
                        </div>

                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                            <div className="bg-green-500/20 p-2 rounded-full">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-green-400/80 uppercase tracking-wider font-bold">Market Price</p>
                                <p className="text-xl font-bold text-green-400">${result.price.toFixed(2)}</p>
                            </div>
                        </div>

                        <p className="text-sm text-white/70 italic leading-relaxed border-l-2 border-ocean-blue pl-3">
                            "{result.description}"
                        </p>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={onAddToCrew}
                        className="w-full py-3 bg-ocean-blue hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add to Crew
                    </button>
                </div>
            </div>
        </div>
    );
};
