import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <div className="flex justify-center items-center gap-4 mb-2">
        <LogoIcon className="w-14 h-14" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight">
          Comic Crafter AI
        </h1>
      </div>
      <p className="text-slate-400 mt-2 text-lg">
        AI-Powered Comic Generation
      </p>
    </header>
  );
};