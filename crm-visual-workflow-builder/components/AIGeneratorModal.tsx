
import React, { useState } from 'react';
import { Node, Edge } from '../types';
import { generateWorkflowFromPrompt } from '../services/geminiService';
import { XIcon, WandSparklesIcon } from './icons';

interface AIGeneratorModalProps {
  onClose: () => void;
  onApply: (workflow: { nodes: Node[]; edges: Edge[] }) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ onClose, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examplePrompts = [
    "When a new lead signs up, send them a welcome email, wait 3 days, then create a task to call them.",
    "If a lead's status is 'Hot', assign them to the sales team and send an SMS notification.",
    "Follow up on abandoned carts. Wait 1 hour, send a reminder email. Wait 1 day, send another email with a discount."
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of the workflow you want to create.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const workflow = await generateWorkflowFromPrompt(prompt);
      onApply(workflow);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col">
        <header className="p-4 bg-slate-800 rounded-t-lg border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <WandSparklesIcon className="text-purple-400"/>
            Generate Workflow with AI
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 space-y-4 bg-slate-50">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Describe your workflow
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., When a new deal is won, send a thank you email to the client..."
            />
          </div>

          <div>
             <p className="text-sm font-medium text-gray-600 mb-2">Or try an example:</p>
             <div className="flex flex-wrap gap-2">
                {examplePrompts.map((p, i) => (
                    <button key={i} onClick={() => setPrompt(p)} className="text-xs text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-full px-3 py-1 transition-colors">
                        {p}
                    </button>
                ))}
             </div>
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        </main>

        <footer className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end rounded-b-lg">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <WandSparklesIcon className="w-4 h-4" />
                    <span>Generate Workflow</span>
                </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};