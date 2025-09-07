import React from 'react';
import type { GeneratedPanel, DialogueEntry } from '../types';
import { RestartIcon } from './icons/RestartIcon';

interface TextComponentProps {
  text: string;
}

const Caption: React.FC<TextComponentProps> = ({ text }) => (
  <div className="w-11/12 mx-auto bg-slate-900/80 p-2 backdrop-blur-sm rounded border border-slate-600/50">
    <p className="text-white text-center font-sans italic text-base">{text}</p>
  </div>
);

interface SpeechBubbleProps {
    speaker: string;
    dialogue: string;
    alignment: 'left' | 'right';
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ speaker, dialogue, alignment }) => {
    const isLeft = alignment === 'left';
    const alignmentClass = isLeft ? 'self-start' : 'self-end';
    const innerAlignmentClass = isLeft ? 'items-start' : 'items-end';
    const tailMarginClass = isLeft ? 'ml-4' : 'mr-4';

    return (
        <div className={`w-fit max-w-[85%] ${alignmentClass} flex flex-col ${innerAlignmentClass}`}>
            <div className="bg-white text-slate-900 rounded-lg p-2.5 shadow-md">
                <p className="font-bold text-slate-800 text-sm mb-1">{speaker.toUpperCase()}</p>
                <p className="text-left text-base">{dialogue}</p>
            </div>
            <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-t-[12px] border-t-white border-r-[10px] border-r-transparent -mt-px ${tailMarginClass}`}></div>
        </div>
    );
};


const ThoughtBubble: React.FC<{ dialogue: string }> = ({ dialogue }) => (
  <div className="w-fit max-w-[85%] self-end flex flex-col items-end">
    <div className="bg-white text-slate-900 p-3 rounded-2xl border-2 border-slate-300 shadow-md relative">
      <p className="text-center italic text-base">{dialogue}</p>
    </div>
    <div className="flex -mt-1 mr-6 gap-1">
      <div className="w-3 h-3 bg-white rounded-full border-2 border-slate-300"></div>
      <div className="w-2 h-2 bg-white rounded-full self-end border-2 border-slate-300"></div>
    </div>
  </div>
);

interface ComicPanelProps {
  panel: GeneratedPanel;
  panelNumber: number;
  onRetry: () => void;
  isRetrying: boolean;
}

const ErrorDisplay: React.FC<{ onRetry: () => void; isRetrying: boolean; scene: string }> = ({ onRetry, isRetrying, scene }) => {
  return (
    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-center items-center text-center p-4 z-30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-red-300">Image Generation Failed</h3>
        <p className="text-xs text-slate-400 mt-2 mb-4 line-clamp-2" title={scene}>Scene: "{scene}"</p>
        
        {isRetrying ? (
            <div className="flex items-center justify-center gap-2 text-slate-300">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Retrying...</span>
            </div>
        ) : (
            <button 
                onClick={onRetry} 
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors"
            >
                <RestartIcon className="w-5 h-5"/>
                Retry
            </button>
        )}
    </div>
  );
};


export const ComicPanel: React.FC<ComicPanelProps> = ({ panel, panelNumber, onRetry, isRetrying }) => {
  const textEntries = panel.dialogues.filter(d => d.dialogue.trim());
  const isError = panel.imageUrl === 'ERROR';
  
  let speechBubbleCounter = 0;

  return (
    <div className="bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden shadow-lg shadow-black/30 comic-panel-container flex flex-col">
      <div className="aspect-square bg-slate-900 flex items-center justify-center relative">
        <span className="absolute top-2 left-2 bg-slate-950 bg-opacity-80 text-blue-400 font-bold text-2xl w-10 h-10 flex items-center justify-center rounded-full border-2 border-slate-700 z-20">
          {panelNumber}
        </span>
        
        {isError && <ErrorDisplay onRetry={onRetry} isRetrying={isRetrying} scene={panel.scene} />}

        {panel.imageUrl && !isError ? (
          <img
            src={panel.imageUrl}
            alt={`Comic panel ${panelNumber}: ${panel.scene}`}
            className="w-full h-full object-cover"
          />
        ) : !isError ? (
          <div className="text-slate-500 p-4 text-center">Generating image...</div>
        ): null}

        {textEntries.length > 0 && !isError && (
          <div className="absolute bottom-0 left-0 right-0 p-2 z-10 flex flex-col-reverse items-stretch space-y-2 space-y-reverse">
             {textEntries.map(entry => {
                const isThought = entry.speaker && /thought/i.test(entry.speaker);
                const isDialogue = entry.speaker && !isThought;
                const isCaption = !entry.speaker;

                if (isCaption) {
                    return <Caption key={entry.id} text={entry.dialogue} />;
                }
                
                if (isDialogue) {
                    const alignment = speechBubbleCounter % 2 === 0 ? 'left' : 'right';
                    speechBubbleCounter++;
                    return <SpeechBubble key={entry.id} speaker={entry.speaker!} dialogue={entry.dialogue} alignment={alignment} />;
                }

                if (isThought) {
                    return <ThoughtBubble key={entry.id} dialogue={entry.dialogue} />;
                }
                
                return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};
