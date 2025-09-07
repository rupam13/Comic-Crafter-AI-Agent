import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import type { Character, StoryPanel, GeneratedPanel, AppView } from './types';
import { generateComicPanels } from './services/geminiService';
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
    // Fix: Added braces around the catch block to correct the syntax. This resolves all subsequent scope-related compilation errors.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // Stay on the storyboard view if there's an error
    } finally {
      setIsLoading(false);
    }
  }, [character]);

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

  // Fix: Added a useEffect hook to handle inconsistent states (e.g., being on the storyboard view without a character).
  // This prevents calling state setters during render, which is a React anti-pattern.
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
        // Fallback to character input if character is null is now handled by useEffect. Return null to prevent rendering during state transition.
        return null;
      case 'comic':
        if (character && generatedComic) {
          return (
            <ComicViewer
              character={character}
              comicTitle={comicTitle}
              generatedComic={generatedComic}
              onStartOver={handleStartOver}
            />
          );
        }
         // Fallback if data is missing is now handled by useEffect. Return null to prevent rendering during state transition.
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
                <strong className="font-bold">System Error: </strong>
                <span className="block sm:inline">{error}</span>
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
