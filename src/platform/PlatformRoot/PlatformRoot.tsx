import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingView } from './views/LandingView';
import { InteractiveDemo } from './views/InteractiveDemo';
import { StressTestView } from './views/StressTestView';
import { DocsView } from './views/DocsView';
import { PricingView } from './views/PricingView';

export const PlatformRoot: React.FC = () => {
    const [currentView, setCurrentView] = useState<string>('landing');

    const resolveViewLayout = () => {
        try {
            switch (currentView) {
                case 'landing': return <LandingView setView={setCurrentView} />;
                case 'demo': return <InteractiveDemo />;
                case 'stress': return <StressTestView />;
                case 'docs': return <DocsView />;
                case 'pricing': return <PricingView />;
                default: return <LandingView setView={setCurrentView} />;
            }
        } catch (err) {
            return (
                <div className="p-8 bg-red-950 text-red-400 border border-red-900 rounded-xl m-4">
                    <h2 className="font-bold text-lg">Krasch i renderingen av vy!</h2>
                    <p className="text-xs font-mono">{String(err)}</p>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-dmsans selection:bg-purple-500/20 selection:text-purple-300 antialiased overflow-x-hidden">
            {/* Decorative radial gradients matching Linear visual guidelines */}
            <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.06),transparent_50%)] pointer-events-none" />

            <Navigation currentView={currentView} setView={setCurrentView} />

            <main className="transition-all duration-200">
                {resolveViewLayout()}
            </main>
        </div>
    );
};

export default PlatformRoot;