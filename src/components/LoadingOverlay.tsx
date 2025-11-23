import React from 'react';
import { Anchor } from 'lucide-react';

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Consulting the Log Pose..." }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-sea/90 backdrop-blur-sm text-white">
            <div className="relative">
                <Anchor className="w-16 h-16 text-pirate-gold animate-bounce" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-pirate-gold/50 rounded-full blur-sm animate-pulse" />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-pirate-gold tracking-wider uppercase">{message}</h2>
            <p className="mt-2 text-ocean-blue font-medium animate-pulse">Navigating the Grand Line...</p>
        </div>
    );
};
