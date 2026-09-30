import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  FluentProvider, createDarkTheme, createLightTheme,
} from '@fluentui/react-components';
import type { BrandVariants, Theme } from '@fluentui/react-components';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import type { ProfileUpdate, User } from '@mazzzali/shared';
import { api } from './api';
import { AppShell } from './components/AppShell';
import { CreateAccountPage, LoginPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecipeDetailPage, RecipesPage } from './pages/RecipePages';
import './styles.css';

type ThemeMode = 'light' | 'dark' | 'system';
interface AppContextValue {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  createAccount: (values: Parameters<typeof api.register>[0]) => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<void>;
  signOut: () => Promise<void>;
  savedIds: string[];
  toggleSaved: (id: string) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const rampKeys = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160] as const;

function makeBrandRamp(hex: string): BrandVariants {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((channel) => Number.parseInt(channel, 16)) ?? [30, 107, 82];
  const ramp = rampKeys.map((step, index) => {
    const mix = index < 8 ? 0.94 - index * 0.115 : (index - 8) * 0.085;
    const target = index < 8 ? 255 : 0;
    const color = channels.map((channel) => Math.round(channel + (target - channel) * mix));
    return [step, `#${color.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`] as const;
  });
  return Object.fromEntries(ramp) as BrandVariants;
}

const brandRamp = makeBrandRamp('#1E6B52');
const lightTheme: Theme = { ...createLightTheme(brandRamp), colorNeutralBackground1: '#FFFFFF', colorNeutralBackground2: '#F4F8F5', colorNeutralForeground1: '#1C2B24', colorNeutralForeground2: '#607168', colorNeutralStroke1: '#D7E3DA' };
const darkTheme: Theme = { ...createDarkTheme(brandRamp), colorNeutralBackground1: '#17221D', colorNeutralBackground2: '#202D26', colorNeutralForeground1: '#F1F6F2', colorNeutralForeground2: '#B6C7BC', colorNeutralStroke1: '#394A40' };

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('App context is unavailable.');
  return context;
}

function AppRoutes({ ready }: { ready: boolean }) {
  const location = useLocation();
  const { user } = useApp();
  if (!ready) return <div className="boot-skeleton" aria-label="Loading your account" />;
  const page = (
    <Routes location={location}>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/login/create-account" element={user ? <Navigate to="/" replace /> : <CreateAccountPage />} />
      <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/recipes" element={user ? <RecipesPage /> : <Navigate to="/login" replace />} />
      <Route path="/recipes/:recipeId" element={user ? <RecipeDetailPage /> : <Navigate to="/login" replace />} />
      <Route path="/goals" element={user ? <GoalsPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
  return <motion.div key={location.pathname} className="route-frame" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>{page}</motion.div>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem('app-theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemDark);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let active = true;
    setReady(false);
    api.getCurrentUser().then((current) => {
      if (active) setUser(current);
    }).catch(() => {
      if (active) setUser(null);
    }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    window.localStorage.setItem('app-theme', mode);
    setThemeModeState(mode);
  };
  const value = useMemo<AppContextValue>(() => ({
    user,
    signIn: async (email, password) => setUser(await api.login({ email, password })),
    createAccount: async (input) => setUser(await api.register(input)),
    updateProfile: async (input) => setUser(await api.updateProfile(input)),
    signOut: async () => { await api.logout(); setUser(null); },
    savedIds,
    toggleSaved: (id) => setSavedIds((current) => current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id]),
    themeMode,
    setThemeMode,
  }), [user, savedIds, themeMode]);

  return (
    <FluentProvider className={isDark ? 'app-theme-dark' : 'app-theme-light'} theme={isDark ? darkTheme : lightTheme} style={{ fontFamily: '"DM Sans", "Segoe UI Variable", "Segoe UI", sans-serif' }}>
      <AppContext.Provider value={value}>
        <BrowserRouter>
          <MotionConfig reducedMotion="user">
            <AppShell>
              <AppRoutes ready={ready} />
            </AppShell>
          </MotionConfig>
        </BrowserRouter>
      </AppContext.Provider>
    </FluentProvider>
  );
}

