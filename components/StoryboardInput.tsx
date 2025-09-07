import React from 'react';
import { useState } from 'react';
import type { Character, StoryPanel, DialogueEntry } from '../types';
import { generateStoryFromPrompt } from '../services/geminiService';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface StoryboardInputProps {
  character: Character;
  onStoryboardSubmit: (title: string, panels: StoryPanel[]) => void;
  onBack: () => void;
}

const createNewDialogueEntry = (): DialogueEntry => ({
  id: `dialogue-${Date.now()}-${Math.random()}`,
  speaker: '',
  dialogue: '',
});

const createNewPanel = (): StoryPanel => ({
  id: `panel-${Date.now()}`,
  scene: '',
  expression: '',
  dialogues: [createNewDialogueEntry()],
});

export const StoryboardInput: React.FC<StoryboardInputProps> = ({ character, onStoryboardSubmit, onBack }) => {
  const [title, setTitle] = useState('');
  const [panels, setPanels] = useState<StoryPanel[]>([createNewPanel()]);
  
  // State for AI story generation
  const [storyPrompt, setStoryPrompt] = useState('');
  const [numPanels, setNumPanels] = useState(4);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    if (!storyPrompt.trim()) {
      setStoryError("Please enter a story prompt.");
      return;
    }
    setIsGeneratingStory(true);
    setStoryError(null);
    try {
      const generatedPanels = await generateStoryFromPrompt(character, storyPrompt, numPanels);
      const panelsWithIds = generatedPanels.map(panel => ({
        ...panel,
        id: `panel-${Date.now()}-${Math.random()}`,
        dialogues: panel.dialogues.map(d => ({
          ...d,
          id: `dialogue-${Date.now()}-${Math.random()}`,
        }))
      }));
      setPanels(panelsWithIds);
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : 'An unknown error occurred while generating the story.');
    } finally {
      setIsGeneratingStory(false);
    }
  };


  const handleAddPanel = () => {
    setPanels([...panels, createNewPanel()]);
  };

  const handleRemovePanel = (panelId: string) => {
    if (panels.length <= 1) return;
    setPanels(panels.filter(panel => panel.id !== panelId));
  };

  const handlePanelChange = (panelId: string, field: 'scene' | 'expression', value: string) => {
    setPanels(panels.map(panel => panel.id === panelId ? { ...panel, [field]: value } : panel));
  };
  
  const handleAddDialogue = (panelId: string) => {
    setPanels(panels.map(panel => 
      panel.id === panelId 
        ? { ...panel, dialogues: [...panel.dialogues, createNewDialogueEntry()] }
        : panel
    ));
  };

  const handleRemoveDialogue = (panelId: string, dialogueId: string) => {
     setPanels(panels.map(panel => {
      if (panel.id === panelId) {
        if (panel.dialogues.length <= 1) return panel;
        return { ...panel, dialogues: panel.dialogues.filter(d => d.id !== dialogueId) };
      }
      return panel;
    }));
  };

  const handleDialogueChange = (panelId: string, dialogueId: string, field: 'speaker' | 'dialogue', value: string) => {
    setPanels(panels.map(panel => 
      panel.id === panelId
        ? { 
            ...panel, 
            dialogues: panel.dialogues.map(d => 
              d.id === dialogueId ? { ...d, [field]: value } : d
            ) 
          }
        : panel
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onStoryboardSubmit(title, panels);
    }
  };
  
  const isFormValid = title.trim() !== '' && panels.length > 0 && panels.every(p => p.scene.trim() !== '' && p.expression.trim() !== '');

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-xl shadow-lg p-8 border border-slate-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-slate-100 tracking-tight mb-2">
        Step 2: Construct the Narrative
      </h2>
      <p className="text-center text-slate-400 mb-6">
        Crafting a story for <span className="font-bold text-blue-300">{character.name}</span>.
      </p>
      
      {/* AI Story Generator */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-8">
        <h3 className="text-lg font-bold text-blue-400 tracking-tight mb-3 text-center sm:text-left flex items-center gap-2">
          <SparklesIcon className="w-5 h-5"/>
          AI Narrative Assistant
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="story-prompt" className="block text-sm font-medium text-slate-300 mb-1">Story Prompt</label>
            <textarea id="story-prompt" rows={2} value={storyPrompt} onChange={(e) => setStoryPrompt(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-blue-500" placeholder={`e.g., ${character.name} discovers a derelict starship.`} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>
              <label htmlFor="num-panels" className="block text-sm font-medium text-slate-300 mb-1">Number of Panels</label>
              <input type="number" id="num-panels" value={numPanels} onChange={(e) => setNumPanels(Math.max(1, parseInt(e.target.value, 10)) || 1)} className="w-full sm:w-32 bg-slate-800 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-blue-500" min="1" max="12"/>
            </div>
            <button type="button" onClick={handleGenerateStory} disabled={isGeneratingStory} className="mt-4 sm:mt-0 sm:self-end flex-1 flex items-center justify-center gap-2 bg-blue-600/50 text-blue-100 py-2.5 px-4 rounded-md hover:bg-blue-600/80 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-wait transition-colors font-semibold">
              {isGeneratingStory ? 'Generating...' : 'Generate Story'}
            </button>
          </div>
          {storyError && <p className="text-red-400 text-sm mt-2">{storyError}</p>}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Comic Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., The Echoes of a Dying Star"
            required
          />
        </div>

        <div className="space-y-6">
          {panels.map((panel, index) => (
            <div key={panel.id} className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-300">Panel {index + 1}</h3>
                {panels.length > 1 && (
                    <button type="button" onClick={() => handleRemovePanel(panel.id)} className="text-slate-500 hover:text-red-500 transition" aria-label="Remove panel">
                      <TrashIcon className="w-6 h-6" />
                    </button>
                )}
              </div>
              <div className="space-y-4">
                  <div>
                    <label htmlFor={`scene-${panel.id}`} className="block text-sm font-medium text-slate-400 mb-1">Scene Description</label>
                    <textarea id={`scene-${panel.id}`} rows={2} value={panel.scene} onChange={(e) => handlePanelChange(panel.id, 'scene', e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-blue-400 transition" placeholder={`e.g., ${character.name} stands on the bridge of an ancient ship.`} required />
                  </div>
                   <div>
                    <label htmlFor={`expression-${panel.id}`} className="block text-sm font-medium text-slate-400 mb-1">Character Expression / Action</label>
                    <input type="text" id={`expression-${panel.id}`} value={panel.expression} onChange={(e) => handlePanelChange(panel.id, 'expression', e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white rounded-md p-2 focus:ring-1 focus:ring-blue-400 transition" placeholder={`e.g., Looking awestruck, touching a holographic console.`} required />
                  </div>
                  <div className="space-y-3 pt-2">
                    {panel.dialogues.map((dialogue) => (
                       <div key={dialogue.id} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end bg-slate-700/50 p-2 rounded">
                          <div className="sm:col-span-2">
                              <label htmlFor={`speaker-${dialogue.id}`} className="block text-xs font-medium text-slate-400 mb-1">Speaker (Optional)</label>
                              <input type="text" id={`speaker-${dialogue.id}`} value={dialogue.speaker} onChange={(e) => handleDialogueChange(panel.id, dialogue.id, 'speaker', e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-400" placeholder="e.g., Arjun"/>
                          </div>
                          <div className="sm:col-span-3">
                              <label htmlFor={`dialogue-${dialogue.id}`} className="block text-xs font-medium text-slate-400 mb-1">Dialogue / Caption</label>
                              <textarea id={`dialogue-${dialogue.id}`} rows={1} value={dialogue.dialogue} onChange={(e) => handleDialogueChange(panel.id, dialogue.id, 'dialogue', e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-blue-400" placeholder="e.g., What happened here?"/>
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            {panel.dialogues.length > 1 && (
                              <button type="button" onClick={() => handleRemoveDialogue(panel.id, dialogue.id)} className="text-slate-500 hover:text-red-500 transition p-2" aria-label="Remove dialogue"><TrashIcon className="w-5 h-5"/></button>
                            )}
                          </div>
                       </div>
                    ))}
                    <p className="text-xs text-slate-500 px-2">Leave 'Speaker' blank for a caption. Include 'thought' for a thought bubble.</p>
                     <button type="button" onClick={() => handleAddDialogue(panel.id)} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-semibold transition pt-1">
                        <PlusIcon className="w-4 h-4" /> Add Dialogue / Caption
                     </button>
                  </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button type="button" onClick={handleAddPanel} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition">
            <PlusIcon className="w-5 h-5" /> Add Another Panel
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
            <button type="submit" disabled={!isFormValid} className="w-full sm:flex-1 font-semibold text-lg tracking-wide bg-blue-600 text-white py-3 rounded-md hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200">
                Generate My Comic!
            </button>
            <button type="button" onClick={onBack} className="w-full sm:w-auto font-semibold text-lg tracking-wide border-2 border-slate-600 text-slate-300 py-3 px-8 rounded-md hover:bg-slate-700 hover:text-white transition-colors duration-200">
                Back
            </button>
        </div>
      </form>
    </div>
  );
};