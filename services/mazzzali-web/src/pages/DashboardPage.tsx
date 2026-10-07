import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button, Card, Text } from '@fluentui/react-components';
import { ClockRegular, FoodRegular, GridRegular, ScaleFillRegular, TargetRegular, ArrowRightRegular, CheckmarkCircleRegular, SearchRegular, ArrowTrendingRegular } from '@fluentui/react-icons';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Goal, RecipeCategory, RecipeSummary } from '@mazzzali/shared';
import { useApp } from '../App';
import { DataState, SectionHeading, type LoadStatus } from '../components/PageParts';

interface DashboardData { goal: Goal | null; recipes: RecipeSummary[]; categories: RecipeCategory[] }

export function DashboardPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [goal, recipeResult, categories] = await Promise.all([api.getGoal(), api.listRecipes({ limit: 3 }), api.listRecipeCategories()]);
      setData({ goal, recipes: recipeResult.recipes, categories });
      setError('');
      setStatus(recipeResult.recipes.length === 0 ? 'empty' : 'data');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your dashboard is temporarily unavailable.');
      setStatus('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const activeGoal = user?.focus === 'weight-loss' ? data?.goal : null;
  const targetDate = activeGoal?.targetDate
    ? new Date(`${activeGoal.targetDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const plannedChange = activeGoal ? Math.max(activeGoal.startingWeight - activeGoal.targetWeight, 0) : 0;
  const planCompletion = activeGoal ? Math.min(100, Math.max(0, Math.round((plannedChange / Math.max(activeGoal.startingWeight, 1)) * 100))) : 0;
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <div className="page-stack dashboard-page">
      <DataState status={status} error={error} onRetry={() => void load()} emptyTitle="Your dashboard is ready for recipes" emptyBody="The plan is connected, but there are no recipes in the library yet." emptyAction={<Button appearance="primary" icon={<SearchRegular />} onClick={() => navigate('/recipes')}>Browse recipes</Button>}>
        {data && <>
          <div className="dashboard-topline">
            <div className="dashboard-intro">
              <Text className="eyebrow">Daily overview</Text>
              <h1 className="page-title">Good morning, {firstName}.</h1>
              <Text className="intro-copy">Your plan, your next meal, and the few numbers worth checking today.</Text>
            </div>
            <div className="quick-actions" aria-label="Quick actions">
              <Button appearance="subtle" className="quick-action" icon={<SearchRegular />} onClick={() => navigate('/recipes')}>Find a meal</Button>
              <Button appearance="primary" className="quick-action quick-action-primary" icon={<TargetRegular />} onClick={() => navigate('/goals')}>Update goal</Button>
            </div>
          </div>

          <section className="dashboard-hero" aria-label="Plan progress">
            <div className="dashboard-hero-main">
              <div className="dashboard-hero-label"><span className="status-dot" /> PLAN AT A GLANCE</div>
              <h2>{activeGoal ? 'Keep the plan simple.' : 'Build your daily plan.'}</h2>
              <Text>{activeGoal ? `You have ${plannedChange.toFixed(1)} ${activeGoal.weightUnit} between your starting and target weights. Consistency matters more than complexity.` : 'Choose a focus and add a goal to turn this space into a useful daily dashboard.'}</Text>
              <div className="hero-actions">
                <Button appearance="primary" icon={<ArrowRightRegular />} onClick={() => navigate('/recipes')}>Plan a meal</Button>
                <Button appearance="subtle" className="hero-secondary" onClick={() => navigate('/goals')}>View progress</Button>
              </div>
            </div>
            <div className="progress-summary">
              <div className="progress-ring" style={{ '--progress': `${planCompletion}%` } as CSSProperties}>
                <div className="progress-ring-inner"><strong>{activeGoal ? `${planCompletion}%` : '—'}</strong><span>planned</span></div>
              </div>
              <div className="progress-copy">
                <strong>{activeGoal ? `${activeGoal.targetWeight.toFixed(1)} ${activeGoal.weightUnit}` : 'No target yet'}</strong>
                <span>{targetDate ? `Target · ${targetDate}` : 'Set a target date when ready'}</span>
              </div>
            </div>
          </section>

          <div className="metric-strip" aria-label="Dashboard metrics">
            <Card className="metric-card metric-accent"><span className="metric-icon"><TargetRegular /></span><div><span>Target</span><strong>{activeGoal ? `${activeGoal.targetWeight.toFixed(1)} ${activeGoal.weightUnit}` : 'Not set'}</strong><small>{activeGoal ? 'Your goal weight' : 'Add a goal'}</small></div></Card>
            <Card className="metric-card"><span className="metric-icon"><ScaleFillRegular /></span><div><span>Planned change</span><strong>{activeGoal ? `${plannedChange.toFixed(1)} ${activeGoal.weightUnit}` : '—'}</strong><small>Start to target</small></div></Card>
            <Card className="metric-card"><span className="metric-icon"><FoodRegular /></span><div><span>Recipes ready</span><strong>{data.recipes.length} picks</strong><small>Quick ideas for today</small></div></Card>
            <Card className="metric-card"><span className="metric-icon"><CheckmarkCircleRegular /></span><div><span>Focus</span><strong>{user?.focus === 'weight-loss' ? 'Weight loss' : 'Healthy eating'}</strong><small>Current direction</small></div></Card>
          </div>

          <div className="dashboard-columns dashboard-columns-minimal">
            <section>
              <SectionHeading title="Meal plan" detail="Next meals to try" icon={<FoodRegular />} />
              <div className="pick-list">
                {data.recipes.map((recipe, index) => (
                  <Link to={`/recipes/${recipe.id}`} className="pick-link" key={recipe.id}>
                    <Card className="pick-card">
                      <span className="pick-index">0{index + 1}</span>
                      <img src={recipe.imageUrl} alt="" />
                      <div className="pick-copy">
                        <strong>{recipe.name}</strong>
                        <Text>{recipe.categories.slice(0, 2).join(' · ')}</Text>
                        <small><ClockRegular /> {recipe.prepMinutes} min · {recipe.servings} servings</small>
                      </div>
                      <span className="card-arrow" aria-hidden="true"><ArrowRightRegular /></span>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading title="Quick actions" detail="Keep momentum" icon={<ArrowTrendingRegular />} />
              <div className="action-stack">
                <button type="button" className="action-card" onClick={() => navigate('/recipes')}><span className="action-card-icon"><SearchRegular /></span><span><strong>Find something to cook</strong><small>Explore all recipes and Shorts</small></span><ArrowRightRegular /></button>
                <button type="button" className="action-card" onClick={() => navigate('/goals')}><span className="action-card-icon"><TargetRegular /></span><span><strong>Review your goal</strong><small>{targetDate ? `Target date · ${targetDate}` : 'Set weight and target date'}</small></span><ArrowRightRegular /></button>
                <button type="button" className="action-card" onClick={() => navigate('/recipes')}><span className="action-card-icon"><GridRegular /></span><span><strong>Browse by category</strong><small>High protein, vegetarian, vegan and more</small></span><ArrowRightRegular /></button>
              </div>
            </section>
          </div>
        </>}
      </DataState>
    </div>
  );
}
