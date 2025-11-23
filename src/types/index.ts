export interface OnePieceCard {
    id: string; // Unique ID (UUID) for the collection instance
    cardCode: string; // e.g., OP01-001
    name: string;
    set: string;
    rarity: string;
    price: number; // USD
    imageUrl: string; // Official URL
    capturedImageUrl?: string; // Fallback
    description: string;
    timestamp: number;
}

export interface CollectionItem extends OnePieceCard {
    // Add any collection-specific fields here if needed in the future
}

export type SortOption = 'bounty' | 'newest' | 'set' | 'rarity';
