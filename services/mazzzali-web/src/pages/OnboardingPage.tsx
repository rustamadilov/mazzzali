import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Field, Input, MessageBar, MessageBarBody, Radio, RadioGroup, Select, Text } from '@fluentui/react-components';
import { CheckmarkCircleRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { EatingFocus, GoalUpdate } from '@mazzzali/shared';
import { useApp } from '../App';
import { PageIntro } from '../components/PageParts';

export function OnboardingPage() {
  const { updateProfile, user } = useApp();
  const navigate = useNavigate();
  const [focus, setFocus] = useState<EatingFocus | ''>('');
  const [weightUnit, setWeightUnit] = useState<GoalUpdate['weightUnit']>('kg');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedFocus = event.currentTarget.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value as EatingFocus | undefined;
    const chosenFocus = selectedFocus ?? focus;
    if (!chosenFocus) {
      setError('Choose the focus that feels right for you.');
      return;
    }
    setError('');
    setBusy(true);
    const values = new FormData(event.currentTarget);
    try {
      if (chosenFocus === 'weight-loss') {
        const goal: GoalUpdate = {
          startingWeight: Number(values.get('startingWeight')),
          targetWeight: Number(values.get('targetWeight')),
          weightUnit,
          targetDate: String(values.get('targetDate')),
        };
        if (!Number.isFinite(goal.startingWeight) || !Number.isFinite(goal.targetWeight)
          || goal.startingWeight <= 0 || goal.targetWeight <= 0 || !goal.targetDate) {
          setError('Enter both weights and choose a target date.');
          return;
        }
        await api.updateGoal(goal);
      }
      await updateProfile({ focus: chosenFocus });
      navigate('/', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your preferences could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return <div className="page-stack">
    <PageIntro eyebrow={`Welcome, ${user?.displayName ?? 'Mazzzali member'}`} title="What brings you here?" body="Choose your focus. If you’re working toward weight loss, add the starting point, target, and date that feel right for you." />
    <Card className="goal-form-card"><form className="goal-form" onSubmit={(event) => void submit(event)}>
      <Field label="Your eating focus" required>
        <RadioGroup value={focus} onChange={(_, data) => setFocus(data.value as EatingFocus)}>
          <Radio value="weight-loss" label="Weight loss" />
          <Radio value="healthy-tasty-eating" label="Healthy, tasty eating" />
        </RadioGroup>
      </Field>
      {focus === 'weight-loss' && <>
        <div className="goal-input-grid">
          <Field label="Starting weight" required><Input name="startingWeight" type="number" min="1" max="1000" step="0.1" placeholder="e.g. 84.2" required /></Field>
          <Field label="Target weight" required><Input name="targetWeight" type="number" min="1" max="1000" step="0.1" placeholder="e.g. 76" required /></Field>
        </div>
        <div className="goal-input-grid">
          <Field label="Weight unit" required><Select name="weightUnit" value={weightUnit} onChange={(_, data) => setWeightUnit(data.value as GoalUpdate['weightUnit'])}><option value="kg">kg</option><option value="lb">lb</option></Select></Field>
          <Field label="Target date" required><Input name="targetDate" type="date" min={today} required /></Field>
        </div>
        <Text className="form-note">Choose a personal target date that feels realistic for you. Your goal can be changed later.</Text>
      </>}
      {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
      <div className="form-actions"><Button appearance="primary" type="submit" disabled={busy} icon={<CheckmarkCircleRegular />}>{busy ? 'Saving your choices…' : 'Continue'}</Button></div>
    </form></Card>
  </div>;
}
