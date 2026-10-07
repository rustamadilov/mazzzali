import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button, Card, Field, Input, MessageBar, MessageBarBody, Tab, TabList, Text } from '@fluentui/react-components';
import { ArrowLeftRegular, BookOpenRegular, PersonAddRegular, PersonArrowRightRegular } from '@fluentui/react-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export function LoginPage() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setBusy(true);
    const values = new FormData(event.currentTarget);
    try { await signIn(String(values.get('email')).trim(), String(values.get('password'))); navigate('/', { replace: true }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Sign in could not be completed.'); }
    finally { setBusy(false); }
  };

  return <AuthFrame eyebrow="Welcome back" title="Good food starts here." body="Sign in to return to your recipes and personal progress." back={false}>
    <TabList selectedValue="signin" className="auth-tabs"><Tab value="create" icon={<PersonAddRegular />} onClick={() => navigate('/login/create-account')}>Create account</Tab><Tab value="signin" icon={<PersonArrowRightRegular />}>Sign in</Tab></TabList>
    <form className="auth-form" onSubmit={(event) => void submit(event)}>
      <Field label="Email" required><Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></Field>
      <Field label="Password" required><Input name="password" type="password" autoComplete="current-password" placeholder="Your password" required /></Field>
      {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
      <Button type="submit" appearance="primary" icon={<PersonArrowRightRegular />} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      <Text className="auth-hint">Demo access: you@example.com · mazzzali-demo</Text>
    </form>
  </AuthFrame>;
}

export function CreateAccountPage() {
  const { createAccount } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setBusy(true);
    const values = new FormData(event.currentTarget);
    const displayName = String(values.get('displayName')).trim();
    const email = String(values.get('email')).trim();
    const password = String(values.get('password'));
    if (password.length < 8) { setError('Choose a password with at least 8 characters.'); setBusy(false); return; }
    try { await createAccount({ displayName, email, password }); navigate('/onboarding', { replace: true }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Your account could not be created.'); }
    finally { setBusy(false); }
  };

  return <AuthFrame eyebrow="A fresh start, your way" title="Good food starts here." body="Create your account first. You’ll choose your eating focus next." back>
    <TabList selectedValue="create" className="auth-tabs"><Tab value="create" icon={<PersonAddRegular />}>Create account</Tab><Tab value="signin" icon={<PersonArrowRightRegular />} onClick={() => navigate('/login')}>Sign in</Tab></TabList>
    <form className="auth-form create-form" onSubmit={(event) => void submit(event)}>
      <Field label="Display name" required><Input name="displayName" autoComplete="name" placeholder="Your name" required /></Field>
      <Field label="Email" required><Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></Field>
      <Field label="Password" required validationMessage="Use at least 8 characters." validationState="warning"><Input name="password" type="password" autoComplete="new-password" minLength={8} required /></Field>
      {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
      <Button type="submit" appearance="primary" icon={<PersonAddRegular />} disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Button>
    </form>
  </AuthFrame>;
}

function AuthFrame({ eyebrow, title, body, back, children }: { eyebrow: string; title: string; body: string; back: boolean; children: ReactNode }) {
  return <main className="auth-page"><div className="auth-art" aria-hidden="true"><img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=85" alt="" /><div className="auth-art-caption"><span>MAZZZALI TABLE</span><strong>Eat well.<br />Feel like you.</strong></div></div>
    <section className="auth-side"><Card className="auth-card">
      {back && <Link to="/login" className="back-link"><ArrowLeftRegular />Back to sign in</Link>}
      <Link to="/" className="auth-wordmark"><span className="brand-mark"><BookOpenRegular /></span>Mazzzali</Link>
      <Text className="eyebrow">{eyebrow}</Text><h1 className="auth-title">{title}</h1><Text className="auth-copy">{body}</Text>
      {children}
    </Card></section>
  </main>;
}