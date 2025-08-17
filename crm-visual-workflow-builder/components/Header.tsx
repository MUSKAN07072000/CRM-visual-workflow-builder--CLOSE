
import React from 'react';
import { TestTubeIcon, PlayCircleIcon, BarChart3Icon, WandSparklesIcon } from './icons';

interface HeaderProps {
  onToggleReporting: () => void;
  onGenerateWithAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleReporting, onGenerateWithAI }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-md z-20">
      <h1 className="text-xl font-bold text-slate-100">Visual Workflow Builder</h1>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onGenerateWithAI}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all shadow-sm hover:shadow-md"
        >
          <WandSparklesIcon className="w-4 h-4" />
          <span>Generate with AI</span>
        </button>
        <button onClick={onToggleReporting} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 border border-slate-600 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors">
          <BarChart3Icon className="w-4 h-4" />
          <span>Reporting</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 border border-slate-600 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors">
          <TestTubeIcon className="w-4 h-4" />
          <span>Test</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors shadow-sm hover:shadow-md">
          <PlayCircleIcon className="w-4 h-4" />
          <span>Deploy</span>
        </button>
      </div>
    </header>
  );
};