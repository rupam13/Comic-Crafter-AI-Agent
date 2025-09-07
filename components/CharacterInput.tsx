import React from 'react';
import { useState } from 'react';
import type { Character } from '../types';

interface CharacterInputProps {
  onCharacterSubmit: (character: Character) => void;
}

export const CharacterInput: React.FC<CharacterInputProps> = ({ onCharacterSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onCharacterSubmit({ name, description });
    }
  };
  
  const isFormValid = name.trim() !== '' && description.trim() !== '';

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 rounded-xl shadow-lg p-8 border border-slate-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-slate-100 tracking-tight mb-6">
        Step 1: Define Your Protagonist
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Character Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Captain Comet"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
            Character Description & Art Style
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., A brave astronaut with a silver suit, a transparent helmet showing a determined face with a scar over one eye. Art style: retro 1950s sci-fi comic."
          />
           <p className="text-xs text-slate-400 mt-2">Maximum detail ensures character consistency across panels. Mention appearance, clothing, and desired art style.</p>
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full font-semibold text-lg tracking-wide bg-blue-600 text-white py-3 rounded-md hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Proceed to Storyboard
        </button>
      </form>
    </div>
  );
};