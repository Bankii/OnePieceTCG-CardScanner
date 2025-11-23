import React, { useMemo } from 'react';
import type { OnePieceCard, SortOption } from '../types';
import { calculateTotalBounty, getSortedCollection } from '../services/storage';
import { Search, Filter } from 'lucide-react';

interface CrewGalleryProps {
    collection: OnePieceCard[];
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    onCardClick: (card: OnePieceCard) => void;
}

export const CrewGallery: React.FC<CrewGalleryProps> = ({ collection, sortBy, onSortChange, onCardClick }) => {
    const totalBounty = useMemo(() => calculateTotalBounty(), [collection]);
    const sortedCards = useMemo(() => getSortedCollection(sortBy), [collection, sortBy]);

    if (collection.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/50 p-8 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Your crew is empty!</p>
                <p className="text-sm">Scan cards to build your bounty.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bounty Header */}
            <div className="bg-gradient-to-r from-pirate-gold/20 to-transparent border-l-4 border-pirate-gold p-4 rounded-r-lg">
                <p className="text-pirate-gold text-xs font-bold uppercase tracking-widest mb-1">Total Crew Bounty</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{totalBounty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-end">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                    <Filter className="w-4 h-4 text-white/50 ml-2" />
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="bg-transparent text-sm text-white focus:outline-none py-1 pr-2 [&>option]:bg-dark-sea"
                    >
                        <option value="newest">Newest</option>
                        <option value="bounty">Highest Bounty</option>
                        <option value="rarity">Rarity</option>
                        <option value="set">Set</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                {sortedCards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => onCardClick(card)}
                        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-pirate-gold/50 transition-colors cursor-pointer group relative"
                    >
                        <div className="aspect-[2.5/3.5] relative">
                            <img
                                src={card.imageUrl}
                                alt={card.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = card.capturedImageUrl || '';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white font-bold text-sm truncate">{card.name}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded">{card.cardCode}</span>
                                    <span className="text-green-400 font-bold text-xs">${card.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
