import { useState, useEffect } from 'react';
import { CameraScanner } from './components/CameraScanner';
import { ResultCard } from './components/ResultCard';
import { CrewGallery } from './components/CrewGallery';
import { LoadingOverlay } from './components/LoadingOverlay';
import { identifyCard } from './services/gemini';
import type { IdentificationResult } from './services/gemini';
import { addToCollection, getCollection } from './services/storage';
import type { OnePieceCard, SortOption } from './types';
import { Ship, Camera, Skull } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ViewState = 'camera' | 'collection';

function App() {
  const [view, setView] = useState<ViewState>('camera');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<IdentificationResult | null>(null);
  const [collection, setCollection] = useState<OnePieceCard[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCard, setSelectedCard] = useState<OnePieceCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load collection on mount
  useEffect(() => {
    setCollection(getCollection());
  }, []);

  const handleCapture = async (base64Image: string) => {
    setCapturedImage(base64Image);
    setIsLoading(true);
    setLoadingMessage("Identifying Card...");
    setError(null);

    try {
      const result = await identifyCard(base64Image);
      setIdentificationResult(result);
    } catch (err) {
      console.error(err);
      setError("Failed to identify card. The Grand Line is treacherous today.");
      setCapturedImage(null); // Reset to allow retry
    } finally {
      setIsLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleAddToCrew = () => {
    if (identificationResult && capturedImage) {
      const newCard: OnePieceCard = {
        id: uuidv4(),
        cardCode: identificationResult.code,
        name: identificationResult.name,
        set: identificationResult.set,
        rarity: identificationResult.rarity,
        price: identificationResult.price,
        imageUrl: identificationResult.image,
        capturedImageUrl: capturedImage,
        description: identificationResult.description,
        timestamp: Date.now(),
      };

      addToCollection(newCard);
      setCollection(getCollection()); // Refresh local state
      setIdentificationResult(null);
      setCapturedImage(null);
      setView('collection'); // Go to collection after adding
    }
  };

  const handleCloseResult = () => {
    setIdentificationResult(null);
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen bg-dark-sea text-white font-sans overflow-hidden flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        {view === 'camera' && (
          <CameraScanner onCapture={handleCapture} />
        )}

        {view === 'collection' && (
          <div className="p-4 min-h-full pb-24">
            <header className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-pirate-gold uppercase tracking-widest flex items-center gap-2">
                <Ship className="w-8 h-8" />
                The Crew
              </h1>
            </header>
            <CrewGallery
              collection={collection}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onCardClick={setSelectedCard}
            />
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-sea/90 backdrop-blur-md border-t border-white/10 p-4 z-30 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setView('camera')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'camera' ? 'text-pirate-gold' : 'text-white/50'}`}
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium">Scan</span>
          </button>

          <button
            onClick={() => setView('collection')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'collection' ? 'text-pirate-gold' : 'text-white/50'}`}
          >
            <Ship className="w-6 h-6" />
            <span className="text-xs font-medium">Crew</span>
          </button>
        </div>
      </nav>

      {/* Overlays */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {identificationResult && capturedImage && (
        <ResultCard
          result={identificationResult}
          capturedImage={capturedImage}
          onAddToCrew={handleAddToCrew}
          onClose={handleCloseResult}
        />
      )}

      {/* Card Detail Modal (Reusing ResultCard for simplicity or creating a read-only view) */}
      {selectedCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-sea border-2 border-pirate-gold rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up relative">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10 bg-black/20 rounded-full p-1"
            >
              <Skull className="w-6 h-6" />
            </button>

            <div className="p-6 flex flex-col gap-6">
              <div className="aspect-[2.5/3.5] relative rounded-lg overflow-hidden border border-pirate-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] mx-auto w-2/3">
                <img
                  src={selectedCard.imageUrl}
                  alt={selectedCard.name}
                  className="w-full h-full object-contain bg-black/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = selectedCard.capturedImageUrl || '';
                  }}
                />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{selectedCard.name}</h3>
                <p className="text-ocean-blue font-medium">{selectedCard.set} • {selectedCard.cardCode}</p>
                <p className="text-pirate-gold font-bold mt-1">{selectedCard.rarity}</p>
              </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-green-400/80 uppercase tracking-wider font-bold text-xs">Current Bounty</span>
                <span className="text-xl font-bold text-green-400">${selectedCard.price.toFixed(2)}</span>
              </div>

              <p className="text-sm text-white/70 italic leading-relaxed text-center">
                "{selectedCard.description}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <Skull className="w-6 h-6 text-red-400" />
            <p className="font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-white/50 hover:text-white">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
