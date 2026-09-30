import { Avatar, Button, Tab, TabList, Toolbar } from '@fluentui/react-components';
import { BookOpenRegular, HomeRegular, PersonRegular, SignOutRegular, WeatherMoonRegular, WeatherSunnyRegular } from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const navigation = [
  { value: '/', label: 'Home', icon: <HomeRegular /> },
  { value: '/recipes', label: 'Recipes', icon: <BookOpenRegular /> },
  { value: '/goals', label: 'Weight goals', icon: <PersonRegular /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, themeMode, setThemeMode } = useApp();
  const isAuthPage = location.pathname.startsWith('/login');
  const selected = location.pathname.startsWith('/recipes') ? '/recipes' : location.pathname === '/goals' ? '/goals' : '/';
  const nextTheme = themeMode === 'dark' ? 'light' : 'dark';

  if (isAuthPage || !user) return <>{children}</>;

  return (
    <div className="app-frame">
      <header className="topbar">
        <Toolbar className="topbar-inner" aria-label="Mazzzali">
          <button type="button" className="wordmark" onClick={() => navigate('/')} aria-label="Mazzzali home">
            <span className="brand-mark"><BookOpenRegular /></span>
            <span>Mazzzali</span>
          </button>
          <div className="topbar-right">
            {user && <span className="welcome-name">Good to see you, {user.displayName.split(' ')[0]}</span>}
            <Button appearance="subtle" icon={nextTheme === 'dark' ? <WeatherMoonRegular /> : <WeatherSunnyRegular />} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`} onClick={() => setThemeMode(nextTheme)} />
            <Button appearance="subtle" className="mode-button" onClick={() => setThemeMode(themeMode === 'system' ? 'light' : 'system')} aria-label={`Theme mode: ${themeMode}`} title={`Theme mode: ${themeMode}`}>{themeMode}</Button>
            {user && <Avatar name={user.displayName} color="brand" size={32} />}
            {user && <Button appearance="subtle" icon={<SignOutRegular />} aria-label="Sign out" title="Sign out" onClick={() => void signOut()} />}
          </div>
        </Toolbar>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        <TabList selectedValue={selected} onTabSelect={(_, data) => navigate(String(data.value))}>
          {navigation.map((item) => <Tab key={item.value} value={item.value} icon={item.icon}>{item.label}</Tab>)}
        </TabList>
      </nav>
      <main className="page-main">{children}</main>
      <footer className="app-footer"><span>Good food, at your pace.</span><span>© 2026 Mazzzali</span></footer>
    </div>
  );
}