import { Avatar, Button } from '@fluentui/react-components';
import { BookOpenRegular, HomeRegular, SignOutRegular, WeatherMoonRegular, WeatherSunnyRegular, SearchRegular, DataAreaRegular, SettingsRegular } from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const navigation = [
  { value: '/', label: 'Home', icon: <HomeRegular /> },
  { value: '/recipes', label: 'Recipes', icon: <BookOpenRegular /> },
  { value: '/goals', label: 'Progress', icon: <DataAreaRegular /> },
  { value: '/#settings', label: 'Settings', icon: <SettingsRegular />, href: '/#settings' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isDark, setThemeMode } = useApp();
  const isAuthPage = location.pathname.startsWith('/login');
  const selected = location.pathname.startsWith('/recipes') ? '/recipes' : location.pathname === '/goals' ? '/goals' : '/';
  const nextTheme = isDark ? 'light' : 'dark';

  if (isAuthPage || !user) return <>{children}</>;

  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-top">
          <button type="button" className="wordmark" onClick={() => navigate('/')} aria-label="Mazzzali home">
            <span className="brand-mark"><BookOpenRegular /></span>
            <span>Mazzzali</span>
          </button>
          <div className="sidebar-label">Workspace</div>
          <nav className="sidebar-nav">
            {navigation.map((item) => (
              <button
                type="button"
                key={item.value}
                className={`sidebar-nav-item ${selected === item.value ? 'is-active' : ''}`}
                onClick={() => item.href ? navigate(item.href) : navigate(item.value)}
                aria-current={selected === item.value ? 'page' : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="sidebar-note-icon"><span /></span>
            <div>
              <strong>Small steps.</strong>
              <span>Big changes.</span>
              <small>Good food, at your pace.</small>
            </div>
          </div>
          <div className="sidebar-controls">
            <Button className="theme-toggle" appearance="subtle" icon={isDark ? <WeatherSunnyRegular /> : <WeatherMoonRegular />} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`} onClick={() => setThemeMode(nextTheme)}><span>{isDark ? 'Light mode' : 'Dark mode'}</span></Button>
            <Button className="signout-button" appearance="subtle" icon={<SignOutRegular />} aria-label="Sign out" title="Sign out" onClick={() => void signOut()} />
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-inner">
            <Button className="search-launch" appearance="subtle" icon={<SearchRegular />} onClick={() => navigate('/recipes')}>
              <span>Search recipes, ingredients, or goals</span>
            </Button>
            <div className="topbar-right">
              <Button appearance="subtle" className="mobile-search" icon={<SearchRegular />} aria-label="Browse recipes" title="Browse recipes" onClick={() => navigate('/recipes')} />
              <div className="profile-chip">
                <Avatar name={user.displayName} color="brand" size={32} />
                <span>{user.displayName.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="page-main">{children}</main>
        <footer id="settings" className="app-footer"><span>Good food, at your pace.</span><span>© 2026 Mazzzali</span></footer>
      </div>
    </div>
  );
}
