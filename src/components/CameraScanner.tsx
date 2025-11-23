import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

interface CameraScannerProps {
    onCapture: (base64Image: string) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean>(false);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasPermission(true);
                setError(null);
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError("Unable to access camera. Please ensure you have granted permissions.");
            setHasPermission(false);
        }
    }, []);

    useEffect(() => {
        startCamera();

        return () => {
            // Cleanup stream
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to base64
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                onCapture(imageData);
            }
        }
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-sea/80 text-white p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-lg font-bold">{error}</p>
                    <button
                        onClick={startCamera}
                        className="mt-4 px-6 py-2 bg-ocean-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry Camera
                    </button>
                </div>
            )}

            {/* Overlay Guide */}
            {hasPermission && !error && (
                <>
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Darkened borders */}
                        <div className="absolute inset-0 bg-black/40 mask-image"
                            style={{
                                maskImage: 'linear-gradient(to bottom, black 0%, transparent 20%, transparent 80%, black 100%), linear-gradient(to right, black 0%, transparent 10%, transparent 90%, black 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 20%, transparent 80%, black 100%), linear-gradient(to right, black 0%, transparent 10%, transparent 90%, black 100%)'
                            }}
                        />

                        {/* Card Guide Box */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-[2.5/3.5] border-2 border-pirate-gold/70 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-pirate-gold rounded-tl-lg" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-pirate-gold rounded-tr-lg" />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-pirate-gold rounded-bl-lg" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-pirate-gold rounded-br-lg" />

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 text-sm font-medium tracking-widest uppercase bg-black/20 px-3 py-1 rounded backdrop-blur-sm">
                                Align Card
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                        <button
                            onClick={handleCapture}
                            className="w-20 h-20 bg-white rounded-full border-4 border-ocean-blue shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                            aria-label="Capture"
                        >
                            <div className="w-16 h-16 bg-ocean-blue rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
