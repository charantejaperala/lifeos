import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Goal, LifeEvent, GoalCategory } from './types';
import {
  fetchGoalsFromDB,
  saveGoalToDB,
  deleteGoalFromDB,
  fetchLifeEventsFromDB,
  saveLifeEventToDB,
  deleteLifeEventFromDB,
  fetchCategoriesFromDB,
  saveCategoryToDB,
  fetchNotificationsApi,
  cleanGoalTitle,
} from './api';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { GoalModal } from './components/GoalModal';
import { GoalDetailModal } from './components/GoalDetailModal';
import { AskAIModal } from './components/AskAIModal';
import { NotificationDrawer, NotificationItem } from './components/NotificationDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useAuth } from './context/AuthContext';
import { printFinancialReport, exportGoalsCSV, exportJSONBackup } from './utils/exportReport';

// Dynamic Lazy Imports for Feature Modules
const ConflictEngineView = lazy(() => import('./components/ConflictEngineView').then((m) => ({ default: m.ConflictEngineView })));
const TimelineView = lazy(() => import('./components/TimelineView').then((m) => ({ default: m.TimelineView })));
const LifeEventsView = lazy(() => import('./components/LifeEventsView').then((m) => ({ default: m.LifeEventsView })));
const TemplatesView = lazy(() => import('./components/TemplatesView').then((m) => ({ default: m.TemplatesView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const CalculatorsView = lazy(() => import('./components/CalculatorsView').then((m) => ({ default: m.CalculatorsView })));
const FinanceQuizView = lazy(() => import('./components/FinanceQuizView').then((m) => ({ default: m.FinanceQuizView })));
const SuperAdminView = lazy(() => import('./components/SuperAdminView').then((m) => ({ default: m.SuperAdminView })));
const CATaxAdvisorView = lazy(() => import('./components/CATaxAdvisorView').then((m) => ({ default: m.CATaxAdvisorView })));
const BankIntegrationsView = lazy(() => import('./components/BankIntegrationsView').then((m) => ({ default: m.BankIntegrationsView })));

const ViewLoader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Loading view module...</span>
  </div>
);

export function MainAppContent() {
  const { user, token, setShowAuthModal, setAuthView } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<string>('INR');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [monthlySurplusINR, setMonthlySurplusINR] = useState<number>(60000); // ₹60,000 surplus
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExportReport = (type: 'pdf' | 'csv' | 'json') => {
    const userName = user ? user.name : 'Guest User';
    if (type === 'pdf') {
      printFinancialReport(goals, lifeEvents, currency, userName);
    } else if (type === 'csv') {
      exportGoalsCSV(goals, currency);
    } else if (type === 'json') {
      exportJSONBackup(goals, lifeEvents);
    }
  };

  const requireAuth = (callback: () => void) => {
    if (!token && !localStorage.getItem('lifeos_token')) {
      setAuthView('login');
      setShowAuthModal(true);
      return false;
    }
    callback();
    return true;
  };

  // State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [categories, setCategories] = useState<GoalCategory[]>([]);


  // Modal controls
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAskAIModal, setShowAskAIModal] = useState<boolean>(false);
  const [initialAiPrompt, setInitialAiPrompt] = useState<string>('');

  const handleOpenAskAI = (prompt?: string) => {
    setInitialAiPrompt(prompt || '');
    setShowAskAIModal(true);
  };

  // Load data dynamically via API (for both Guest and Authenticated users)
  useEffect(() => {
    fetchGoalsFromDB().then((dbGoals) => {
      setGoals(dbGoals || []);
    });
    fetchLifeEventsFromDB().then((dbEvents) => {
      setLifeEvents(dbEvents || []);
    });
    fetchCategoriesFromDB().then((dbCats) => {
      setCategories(dbCats || []);
    });
    fetchNotificationsApi().then((data) => {
      setNotifications(data || []);
    });
  }, [user, token]);

  // Persistence
  useEffect(() => {
    if (token) {
      localStorage.setItem('lifeos_user_goals', JSON.stringify(goals));
    } else {
      localStorage.setItem('lifeos_goals', JSON.stringify(goals));
    }
  }, [goals, token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('lifeos_user_life_events', JSON.stringify(lifeEvents));
    } else {
      localStorage.setItem('lifeos_life_events', JSON.stringify(lifeEvents));
    }
  }, [lifeEvents, token]);

  useEffect(() => {
    localStorage.setItem('lifeos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handlers
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleCreateOrUpdateGoal = (goalData: Partial<Goal>) => {
    if (selectedGoal) {
      // Edit existing
      const updated = { ...selectedGoal, ...goalData } as Goal;
      setGoals((prev) =>
        prev.map((g) => (g.id === selectedGoal.id ? updated : g))
      );
      saveGoalToDB(updated);
      setSelectedGoal(null);
    } else {
      // Create new
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        name: cleanGoalTitle(goalData.name || 'New Goal'),
        description: goalData.description || '',
        goalType: goalData.goalType || 'Custom',
        category: goalData.category || 'Family',
        customCategory: goalData.customCategory,
        targetAmount: goalData.targetAmount || 1000000,
        currency: goalData.currency || currency,
        targetDate: goalData.targetDate || '2030-12-31',
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        priority: goalData.priority || 'High',
        owner: goalData.owner || user?.name || 'Guest User',
        beneficiaries: goalData.beneficiaries || ['Self'],
        currentAmount: goalData.currentAmount || 0,
        monthlyContribution: goalData.monthlyContribution || 10000,
        oneTimeContribution: goalData.oneTimeContribution || 0,
        expectedInflation: goalData.expectedInflation || 6,
        expectedReturn: goalData.expectedReturn || 10,
        fundingSources: goalData.fundingSources || [
          { id: 'fs-new', name: 'Salary Savings', plannedAmount: goalData.targetAmount || 1000000, actualAmount: goalData.currentAmount || 0 }
        ],
        notes: goalData.notes,
        tags: goalData.tags || ['Custom'],
        subGoals: [],
        budgetItems: [],
        contributions: [],
        dependencies: [],
        status: goalData.status || 'ON TRACK',
      };
      setGoals((prev) => [newGoal, ...prev]);
      saveGoalToDB(newGoal);
    }
    setShowCreateModal(false);
  };

  const handleUpdateGoalDirect = (updated: Goal) => {
    if (!requireAuth('modify goals')) return;
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    saveGoalToDB(updated);
    if (selectedGoal?.id === updated.id) {
      setSelectedGoal(updated);
    }
  };

  const handleAddCustomCategory = (name: string, description: string) => {
    const newCat: GoalCategory = {
      id: `cat-custom-${Date.now()}`,
      name,
      isCustom: true,
      description,
    };
    setCategories((prev) => [...prev, newCat]);
    saveCategoryToDB(newCat);
  };

  const handleAddLifeEvent = (newEvent: LifeEvent) => {
    setLifeEvents((prev) => [newEvent, ...prev]);
    saveLifeEventToDB(newEvent);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!requireAuth('delete goals')) return;
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    deleteGoalFromDB(goalId);
    if (selectedGoal?.id === goalId) setSelectedGoal(null);
  };

  const handleDeleteLifeEvent = (eventId: string) => {
    if (!requireAuth('delete life events')) return;
    setLifeEvents((prev) => prev.filter((e) => e.id !== eventId));
    deleteLifeEventFromDB(eventId);
  };

  const handleBatchCreateGoalsFromAI = (batch: Partial<Goal>[]) => {
    const createdList: Goal[] = batch.map((item, idx) => ({
      id: `goal-ai-${Date.now()}-${idx}`,
      name: cleanGoalTitle(item.name || 'AI Generated Goal'),
      description: item.description || 'Generated via LIFEOS AI Engine',
      goalType: item.goalType || 'Custom',
      category: item.category || 'Family',
      customCategory: item.customCategory,
      targetAmount: item.targetAmount || 500000,
      currency: item.currency || currency,
      targetDate: item.targetDate || '2030-12-31',
      startDate: new Date().toISOString().split('T')[0],
      priority: item.priority || 'Medium',
      owner: user?.name || 'Guest User',
      beneficiaries: ['Self'],
      currentAmount: item.currentAmount || 0,
      monthlyContribution: item.monthlyContribution || 10000,
      oneTimeContribution: 0,
      expectedInflation: item.expectedInflation || 6,
      expectedReturn: item.expectedReturn || 10,
      fundingSources: [],
      status: 'ON TRACK',
      tags: ['AI Assistant', 'Generated'],
    }));

    setGoals((prev) => [...createdList, ...prev]);
    createdList.forEach((g) => saveGoalToDB(g));
  };

  const handleInstantiateTemplate = (name: string, category: string, targetAmount: number, inflation: number) => {
    const newGoalData: Partial<Goal> = {
      name,
      category,
      targetAmount,
      currency: 'INR',
      targetDate: '2030-12-31',
      expectedInflation: inflation,
      expectedReturn: 10,
      currentAmount: 0,
      monthlyContribution: Math.round(targetAmount / 60),
      priority: 'High',
      status: 'ON TRACK',
      goalType: 'Predefined',
    };
    handleCreateOrUpdateGoal(newGoalData);
  };

  return (
    <div className="app-container" data-theme={theme}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAskAI={handleOpenAskAI}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        goals={goals}
        currency={currency}
      />

      <div className="main-wrapper">
        <Header
          currentCurrency={currency}
          setCurrency={setCurrency}
          theme={theme}
          toggleTheme={toggleTheme}
          openAskAI={handleOpenAskAI}
          toggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onExportReport={handleExportReport}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          unreadCount={notifications.filter((n) => !n.read).length}
        />

        <Suspense fallback={<ViewLoader />}>
          {activeTab === 'dashboard' && (
            <DashboardView
              goals={goals}
              currency={currency}
              onOpenCreateModal={() => requireAuth(() => {
                setSelectedGoal(null);
                setShowCreateModal(true);
              })}
              onSelectGoal={(g) => setSelectedGoal(g)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAskAI={handleOpenAskAI}
              monthlySurplusINR={monthlySurplusINR}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              categories={categories}
              currency={currency}
              onOpenCreateModal={() => requireAuth(() => {
                setSelectedGoal(null);
                setShowCreateModal(true);
              })}
              onSelectGoal={(g) => setSelectedGoal(g)}
              onAddCustomCategory={handleAddCustomCategory}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictEngineView
              goals={goals}
              currency={currency}
              monthlySurplusINR={monthlySurplusINR}
              onUpdateGoal={handleUpdateGoalDirect}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineView
              goals={goals}
              lifeEvents={lifeEvents}
              currency={currency}
              onSelectGoal={(g) => setSelectedGoal(g)}
              onUpdateGoal={handleUpdateGoalDirect}
              onDeleteGoal={handleDeleteGoal}
              onDeleteLifeEvent={handleDeleteLifeEvent}
            />
          )}

          {activeTab === 'events' && (
            <LifeEventsView
              lifeEvents={lifeEvents}
              currency={currency}
              onAddLifeEvent={(evt) => requireAuth(() => handleAddLifeEvent(evt))}
              onDeleteLifeEvent={handleDeleteLifeEvent}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              onInstantiateTemplate={(tmpl) => requireAuth(() => handleInstantiateTemplate(tmpl))}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              goals={goals}
              currency={currency}
            />
          )}

          {activeTab === 'calculators' && (
            <CalculatorsView currency={currency} />
          )}

          {activeTab === 'quiz' && (
            <FinanceQuizView />
          )}

          {activeTab === 'ca-advisor' && (
            <CATaxAdvisorView currency={currency} />
          )}

          {activeTab === 'bank-sync' && (
            <BankIntegrationsView currency={currency} />
          )}

          {activeTab === 'superadmin' && (
            <SuperAdminView />
          )}

          {(activeTab === 'budget' || activeTab === 'funding') && (
            <GoalsView
              goals={goals}
              categories={categories}
              currency={currency}
              onOpenCreateModal={() => {
                setSelectedGoal(null);
                setShowCreateModal(true);
              }}
              onSelectGoal={(g) => setSelectedGoal(g)}
              onAddCustomCategory={handleAddCustomCategory}
              onDeleteGoal={handleDeleteGoal}
            />
          )}
        </Suspense>
      </div>

      {/* Goal Creator / Edit Modal */}
      {showCreateModal && (
        <GoalModal
          categories={categories}
          initialGoal={selectedGoal}
          onSave={handleCreateOrUpdateGoal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedGoal(null);
          }}
        />
      )}

      {/* Goal Detail, Sub-goals & Budget Modal */}
      {selectedGoal && !showCreateModal && (
        <GoalDetailModal
          goal={selectedGoal}
          currency={currency}
          onUpdateGoal={handleUpdateGoalDirect}
          onClose={() => setSelectedGoal(null)}
          onDeleteGoal={handleDeleteGoal}
        />
      )}

      {/* Ask LIFEOS AI Modal */}
      {showAskAIModal && (
        <AskAIModal
          initialPrompt={initialAiPrompt}
          onClose={() => setShowAskAIModal(false)}
          onBatchCreateGoals={handleBatchCreateGoalsFromAI}
        />
      )}

      {/* Right Side Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onMarkAsRead={handleMarkNotificationAsRead}
        onDismiss={handleDismissNotification}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenAskAI={handleOpenAskAI}
      />

      {/* Global Authentication Modal */}
      <AuthModal />

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAskAI={handleOpenAskAI}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

