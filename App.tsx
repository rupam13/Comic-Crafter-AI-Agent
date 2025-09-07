import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import type { Character, StoryPanel, GeneratedPanel, AppView } from './types';
import { generateComicPanels, regenerateSinglePanel } from './services/geminiService';
import { Header } from './components/Header';
import { CharacterInput } from './components/CharacterInput';
import { StoryboardInput } from './components/StoryboardInput';
import { ComicViewer } from './components/ComicViewer';
import { Loader } from './components/Loader';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('character');
  const [character, setCharacter] = useState<Character | null>(null);
  const [comicTitle, setComicTitle] = useState<string>('');
  const [generatedComic, setGeneratedComic] = useState<GeneratedPanel[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryingPanelId, setRetryingPanelId] = useState<string | null>(null);

  const handleCharacterSubmit = useCallback((char: Character) => {
    setCharacter(char);
    setView('storyboard');
  }, []);

  const handleStoryboardSubmit = useCallback(async (title: string, panels: StoryPanel[]) => {
    if (!character) return;
    setIsLoading(true);
    setError(null);
    setComicTitle(title);
    try {
      const comic = await generateComicPanels(character, panels);
      setGeneratedComic(comic);
      setView('comic');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [character]);
  
  const handleRetryPanel = useCallback(async (panelIdToRetry: string) => {
    if (!character || !generatedComic) return;

    setRetryingPanelId(panelIdToRetry);
    setError(null);

    try {
      const panelIndex = generatedComic.findIndex(p => p.id === panelIdToRetry);
      if (panelIndex === -1) throw new Error("Panel not found");

      const panelToRetry = generatedComic[panelIndex];

      // Find the last successful image URL for consistency.
      // Loop backwards from the current panel's index.
      let previousImageUrl: string | undefined = undefined;
      for (let i = panelIndex - 1; i >= 0; i--) {
        if (generatedComic[i].imageUrl !== 'ERROR') {
          previousImageUrl = generatedComic[i].imageUrl;
          break;
        }
      }

      const newImageUrl = await regenerateSinglePanel(character, panelToRetry, previousImageUrl);
      
      // Update state immutably
      const updatedComic = generatedComic.map(p => 
        p.id === panelIdToRetry ? { ...p, imageUrl: newImageUrl } : p
      );
      setGeneratedComic(updatedComic);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during retry.');
    } finally {
      setRetryingPanelId(null);
    }
  }, [character, generatedComic]);

  const handleStartOver = useCallback(() => {
    setView('character');
    setCharacter(null);
    setComicTitle('');
    setGeneratedComic(null);
    setError(null);
    setIsLoading(false);
  }, []);
  
  const handleBackToCharacter = useCallback(() => {
    setView('character');
  }, []);

  useEffect(() => {
    if ((view === 'storyboard' && !character) || (view === 'comic' && (!character || !generatedComic))) {
      handleStartOver();
    }
  }, [view, character, generatedComic, handleStartOver]);

  const renderContent = () => {
    switch (view) {
      case 'character':
        return <CharacterInput onCharacterSubmit={handleCharacterSubmit} />;
      case 'storyboard':
        if (character) {
          return <StoryboardInput character={character} onStoryboardSubmit={handleStoryboardSubmit} onBack={handleBackToCharacter} />;
        }
        return null;
      case 'comic':
        if (character && generatedComic) {
          return (
            <ComicViewer
              character={character}
              comicTitle={comicTitle}
              generatedComic={generatedComic}
              onStartOver={handleStartOver}
              onRetryPanel={handleRetryPanel}
              retryingPanelId={retryingPanelId}
            />
          );
        }
        return null;
      default:
        return <CharacterInput onCharacterSubmit={handleCharacterSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      {isLoading && <Loader />}
      <Header />
      <main className="mt-8">
        {error && (
            <div className="w-full max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                 <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
                    <svg className="fill-current h-6 w-6 text-red-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}
        {renderContent()}
      </main>
       <footer className="text-center text-slate-500 py-8 mt-12">
        <p>Powered by the Google Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
