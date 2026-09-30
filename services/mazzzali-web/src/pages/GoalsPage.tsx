import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Field, Input, Option, Radio, RadioGroup, Select, Text } from '@fluentui/react-components';
import { CheckmarkCircleRegular, TargetRegular } from '@fluentui/react-icons';
import { api } from '../api';
import type { EatingFocus, Goal, GoalUpdate } from '@mazzzali/shared';
import { useApp } from '../App';
import { DataState, PageIntro, SectionHeading, type LoadStatus } from '../components/PageParts';

export function GoalsPage() {
  const { updateProfile } = useApp();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [focus, setFocus] = useState<EatingFocus>('weight-loss');
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [currentGoal, user] = await Promise.all([api.getGoal(), api.getCurrentUser()]);
      const activeGoal = user.focus === 'weight-loss' ? currentGoal : null;
      setGoal(activeGoal);
      setFocus(user.focus);
      setError('');
      setStatus(activeGoal ? 'data' : 'empty');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Weight goals are temporarily unavailable.');
      setStatus('error');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const saveGoal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const startingWeight = Number(values.get('startingWeight'));
    const targetWeight = Number(values.get('targetWeight'));
    const weightUnit = String(values.get('weightUnit')) as GoalUpdate['weightUnit'];
    if (focus === 'weight-loss' && (!Number.isFinite(startingWeight) || !Number.isFinite(targetWeight) || startingWeight <= 0 || targetWeight <= 0)) {
      setValidationError('Enter a starting and target weight greater than zero.'); return;
    }
    setValidationError(''); setNotice(''); setSaving(true);
    try {
      await updateProfile({ focus });
      if (focus === 'weight-loss') {
        const savedGoal = await api.updateGoal({ startingWeight, targetWeight, weightUnit });
        setGoal(savedGoal);
        setStatus('data');
        setNotice('Your eating focus and weight goal have been saved.');
      } else {
        setGoal(null);
        setStatus('data');
        setNotice('Your healthy eating focus has been saved. No weight goal is active.');
      }
    } catch (cause) {
      setValidationError(cause instanceof Error ? cause.message : 'Could not save your weight goal.');
    } finally { setSaving(false); }
  };

  return <div className="page-stack">
    <PageIntro eyebrow="Your own measure" title="Weight goals" body="Choose a healthy-eating focus or add starting and target weights for your weight-loss focus. Your goals can change whenever you do." />
    {status === 'loading' && <div className="skeleton-stack"><Card className="skeleton-card"><span /><span /><span /></Card></div>}
    {status === 'error' && <DataState status="error" error={error} onRetry={() => void load()} emptyTitle="Goals unavailable" emptyBody="Your profile and goals are temporarily unavailable." />}
    {status === 'empty' && !showForm && <DataState status="empty" onRetry={() => void load()} emptyTitle="No weight goal set" emptyBody="Choose an eating focus now. Starting and target weights are optional until you are ready." emptyAction={<Button appearance="primary" icon={<TargetRegular />} onClick={() => { setShowForm(true); setStatus('data'); }}>Choose your eating focus</Button>} />}
    {(status === 'data' || showForm) && <section>
      <SectionHeading title="Your eating focus" detail={goal ? `Last updated ${new Date(`${goal.updatedAt}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No weight goal set'} icon={<TargetRegular />} />
      <Card className="goal-form-card"><form className="goal-form" onSubmit={(event) => void saveGoal(event)}>
        <Field label="Choose your focus"><RadioGroup value={focus} onChange={(_, data) => setFocus(data.value as EatingFocus)}>
          <Radio value="weight-loss" label="Weight loss" />
          <Radio value="healthy-tasty-eating" label="Healthy, tasty eating" />
        </RadioGroup></Field>
        {focus === 'weight-loss' && <>
          <div className="goal-input-grid">
            <Field label="Starting weight" validationMessage="Personal goals are flexible and can be updated at any time." validationState="warning"><Input name="startingWeight" type="number" min="1" step="0.1" defaultValue={goal?.startingWeight.toFixed(1)} required /></Field>
            <Field label="Target weight"><Input name="targetWeight" type="number" min="1" step="0.1" defaultValue={goal?.targetWeight.toFixed(1)} required /></Field>
          </div>
          <Field label="Unit"><Select name="weightUnit" defaultValue={goal?.weightUnit ?? 'kg'}><Option value="kg">kg</Option><Option value="lb">lb</Option></Select></Field>
          <Text className="form-note">Only your starting and target weights are stored. No ongoing weigh-in history is collected.</Text>
        </>}
        {validationError && <Text role="alert" className="validation-error">{validationError}</Text>}
        {notice && <Text role="status" className="success-note"><CheckmarkCircleRegular />{notice}</Text>}
        <div className="form-actions"><Button appearance="primary" type="submit" disabled={saving} icon={<CheckmarkCircleRegular />}>{saving ? 'Saving changes…' : 'Save focus and goal'}</Button></div>
      </form></Card>
    </section>}
  </div>;
}