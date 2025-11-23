import type { OnePieceCard, SortOption } from '../types';

const STORAGE_KEY = 'one_piece_crew_collection';

export const getCollection = (): OnePieceCard[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const addToCollection = (card: OnePieceCard): void => {
    const collection = getCollection();
    const updated = [card, ...collection];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const removeFromCollection = (cardId: string): void => {
    const collection = getCollection();
    const updated = collection.filter(c => c.id !== cardId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getSortedCollection = (sortBy: SortOption): OnePieceCard[] => {
    const collection = getCollection();

    switch (sortBy) {
        case 'bounty':
            return [...collection].sort((a, b) => b.price - a.price);
        case 'newest':
            return [...collection].sort((a, b) => b.timestamp - a.timestamp);
        case 'set':
            return [...collection].sort((a, b) => a.set.localeCompare(b.set));
        case 'rarity':
            // Simple alphabetical sort for rarity for now, could be improved with a rarity rank map
            return [...collection].sort((a, b) => a.rarity.localeCompare(b.rarity));
        default:
            return collection;
    }
};

export const calculateTotalBounty = (): number => {
    const collection = getCollection();
    return collection.reduce((total, card) => total + card.price, 0);
};
