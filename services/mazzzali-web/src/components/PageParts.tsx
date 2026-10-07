import { Button, Card, CardHeader, MessageBar, MessageBarBody, MessageBarTitle, Skeleton, SkeletonItem, Text, Title2, Title3 } from '@fluentui/react-components';
import { ArrowRightRegular, BoxRegular } from '@fluentui/react-icons';
import type { ReactNode } from 'react';

export type LoadStatus = 'loading' | 'error' | 'empty' | 'data';

export function SectionHeading({ title, detail, icon }: { title: string; detail?: string; icon: ReactNode }) {
  return <div className="section-heading"><div className="section-heading-title"><span className="section-icon">{icon}</span><Title2>{title}</Title2></div>{detail && <Text className="section-detail">{detail}</Text>}</div>;
}

export function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="page-intro"><Text className="eyebrow">{eyebrow}</Text><Title1Shim>{title}</Title1Shim><Text className="intro-copy">{body}</Text></header>;
}

function Title1Shim({ children }: { children: ReactNode }) {
  return <h1 className="page-title">{children}</h1>;
}

export function HeroPanel({ eyebrow, title, body, primary, secondary, onPrimary, onSecondary, metrics }: {
  eyebrow: string; title: string; body: string; primary: string; secondary: string;
  onPrimary: () => void; onSecondary: () => void; metrics: ReactNode;
}) {
  return (
    <Card className="hero-panel">
      <div className="hero-decor hero-decor-one" aria-hidden="true" />
      <div className="hero-decor hero-decor-two" aria-hidden="true" />
      <div className="hero-content">
        <Text className="hero-eyebrow"><span />{eyebrow}</Text>
        <h2 className="hero-title">{title}</h2>
        <Text className="hero-copy">{body}</Text>
        <div className="hero-actions"><Button appearance="primary" icon={<ArrowRightRegular />} onClick={onPrimary}>{primary}</Button><Button appearance="subtle" className="hero-secondary" onClick={onSecondary}>{secondary}</Button></div>
      </div>
      <div className="hero-metrics">{metrics}</div>
    </Card>
  );
}

export function DataState({ status, error, onRetry, emptyTitle, emptyBody, emptyAction, children }: {
  status: LoadStatus; error?: string; onRetry: () => void; emptyTitle: string; emptyBody: string; emptyAction?: ReactNode; children?: ReactNode;
}) {
  if (status === 'data') return <>{children}</>;
  if (status === 'loading') {
    return <div className="skeleton-stack" aria-label="Loading content" aria-busy="true"><Skeleton><SkeletonItem size={48} /><SkeletonItem size={16} /><SkeletonItem size={16} /></Skeleton><Skeleton><SkeletonItem size={96} style={{ height: 144 }} /><SkeletonItem size={16} /></Skeleton></div>;
  }
  if (status === 'error') return <MessageBar intent="error" className="inline-error"><MessageBarTitle>We couldn’t load this just now</MessageBarTitle><MessageBarBody>{error ?? 'Please check your connection and try again.'}<Button appearance="secondary" onClick={onRetry}>Try again</Button></MessageBarBody></MessageBar>;
  return <Card className="empty-panel"><span className="empty-icon"><BoxRegular fontSize={36} /></span><Title3>{emptyTitle}</Title3><Text>{emptyBody}</Text>{emptyAction}</Card>;
}

export function StatCard({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string; detail: string; tone?: 'coral' | 'green' }) {
  return <Card className={`stat-card ${tone === 'coral' ? 'stat-card-coral' : ''} ${tone === 'green' ? 'stat-card-green' : ''}`}><CardHeader image={<span className="stat-icon">{icon}</span>} header={<Text className="stat-label">{label}</Text>} /><Text className="stat-value">{value}</Text><Text className="stat-detail">{detail}</Text></Card>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <Title3 className="card-title">{children}</Title3>;
}
