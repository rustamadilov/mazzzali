import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Text } from '@fluentui/react-components';
import { CalendarRegular, ClockRegular, FoodRegular, GridRegular, PersonRegular, ScaleFillRegular, TargetRegular } from '@fluentui/react-icons';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Goal, RecipeCategory, RecipeSummary } from '@mazzzali/shared';
import { useApp } from '../App';
import { DataState, HeroPanel, SectionHeading, StatCard, type LoadStatus } from '../components/PageParts';

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

  return (
    <div className="page-stack">
      <DataState status={status} error={error} onRetry={() => void load()} emptyTitle="A good recipe starts here" emptyBody="There are no recipes to show yet. Browse again after the collection is ready." emptyAction={<Button appearance="primary" onClick={() => navigate('/recipes')}>Browse recipes</Button>}>
        {data && <>
          <HeroPanel eyebrow={`A fresh page for good food · ${user?.displayName ?? 'Mazzzali member'}`} title="Good food, at your own pace." body={activeGoal ? 'Your weight-loss focus, your own starting and target weights, and a few delicious ideas to bring to the table.' : 'Choose the recipes you enjoy. Add starting and target weights whenever they feel useful.'} primary="Find a recipe" secondary="Review your goal" onPrimary={() => navigate('/recipes')} onSecondary={() => navigate('/goals')} metrics={<div className="hero-note"><span>YOUR FOCUS</span><strong>{user?.focus === 'weight-loss' ? 'Weight loss' : 'Healthy, tasty eating'}</strong><small>{activeGoal ? 'Personal goal saved' : 'No weight goal set'}</small></div>} />
          <div className="stats-grid" aria-label="Weight goal overview">
            <StatCard icon={<PersonRegular />} label="Chosen focus" value={user?.focus === 'weight-loss' ? 'Weight loss' : 'Healthy eating'} detail="Your selected eating focus" />
            <StatCard icon={<ScaleFillRegular />} label="Starting weight" value={activeGoal ? `${activeGoal.startingWeight.toFixed(1)} ${activeGoal.weightUnit}` : 'Not set'} detail="Entered by you" />
            <StatCard icon={<TargetRegular />} label="Target weight" value={activeGoal ? `${activeGoal.targetWeight.toFixed(1)} ${activeGoal.weightUnit}` : 'Not set'} detail="Entered by you" tone="coral" />
          </div>
          <div className="dashboard-columns">
            <section>
              <SectionHeading title="Recipe picks" detail="Three ideas to try" icon={<FoodRegular />} />
              <div className="pick-list">{data.recipes.map((recipe) => <Link to={`/recipes/${recipe.id}`} className="pick-link" key={recipe.id}><Card className="pick-card"><img src={recipe.imageUrl} alt="" /><div className="pick-copy"><strong>{recipe.name}</strong><Text>{recipe.categories.slice(0, 2).join(' · ')}</Text><small><ClockRegular /> {recipe.prepMinutes} min · {recipe.servings} servings</small></div></Card></Link>)}</div>
            </section>
            <section>
              <SectionHeading title="Browse by category" detail="Eight ways in" icon={<GridRegular />} />
              <div className="category-picks">{data.categories.map((category) => <Link key={category} to="/recipes" className="category-pick"><CalendarRegular />{category}</Link>)}</div>
            </section>
          </div>
        </>}
      </DataState>
    </div>
  );
}