import React from 'react';
import { LayoutDashboard, Target, Sparkles, Milestone, BrainCircuit } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAskAI: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  openAskAI,
}) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'ask-ai', label: 'Ask AI', icon: Sparkles, isAction: true },
    { id: 'timeline', label: 'Timeline', icon: Milestone },
    { id: 'quiz', label: 'Quiz', icon: BrainCircuit },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isAction) {
          return (
            <button
              key={item.id}
              className="mobile-bottom-nav-action"
              onClick={openAskAI}
              title="Ask LIFEOS AI"
            >
              <div className="mobile-action-circle">
                <Sparkles size={20} color="#ffffff" />
              </div>
              <span className="mobile-action-label">AI</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
