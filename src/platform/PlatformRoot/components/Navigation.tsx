import React from 'react';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const links = [
    { id: 'landing', label: 'Product Overview' },
    { id: 'demo', label: 'Interactive Demo' },
    { id: 'stress', label: 'Stress Benchmark' },
    { id: 'docs', label: 'Documentation Starter' },
    { id: 'pricing', label: 'Pricing plans' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-900 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setView('landing')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-base font-syne font-bold text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            S
          </div>
          <span className="font-syne text-md font-bold tracking-tight text-white">
            Smart PDF <span className="text-purple-400 font-medium">Exporter</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => setView(link.id)}
              className={`px-4 py-2 rounded-md font-dmsans text-xs font-medium transition-colors ${
                currentView === link.id
                  ? 'bg-gray-900 text-purple-400 border border-gray-800/60'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('demo')}
            className="rounded-lg border border-purple-500/30 bg-purple-600/20 px-4 py-1.5 font-dmsans text-xs font-semibold text-purple-300 shadow-md transition-all hover:bg-purple-600 hover:text-white focus:outline-none"
          >
            Launch Live Engine
          </button>
        </div>
      </div>
    </nav>
  );
};