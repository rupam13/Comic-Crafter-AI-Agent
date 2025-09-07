import React from 'react';
import { useState, useEffect } from 'react';

const loadingMessages = [
  "Initializing generation engine...",
  "Processing narrative structure...",
  "Generating visual assets...",
  "Compositing comic panels...",
  "Finalizing layout...",
  "Almost there...",
];

export const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage((prevMessage) => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center z-50">
      <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-2 border-blue-500/50 animate-ping-slow"></div>
          <div className="absolute w-2/3 h-2/3 rounded-full border-2 border-blue-500/60 animate-ping-medium"></div>
          <div className="absolute w-1/3 h-1/3 rounded-full bg-blue-500/70"></div>
      </div>
      <p className="text-white text-xl font-medium tracking-wider mt-12 transition-opacity duration-500">
        {message}
      </p>
      <style>{`
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes ping-medium {
          75%, 100% {
            transform: scale(1.75);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-medium {
          animation: ping-medium 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
};