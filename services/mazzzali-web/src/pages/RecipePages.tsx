import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Field, Input, Tab, TabList, Text } from '@fluentui/react-components';
import { BookmarkRegular, BookOpenRegular, ClockRegular, FoodRegular, SearchRegular, VideoRegular, LinkRegular } from '@fluentui/react-icons';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Recipe, RecipeCategory, RecipeSummary } from '@mazzzali/shared';
import { useApp } from '../App';
import { DataState, PageIntro, SectionHeading, type LoadStatus } from '../components/PageParts';

export function RecipesPage() {
  const { savedIds } = useApp();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<RecipeCategory | 'all'>('all');
  const [tab, setTab] = useState<'discover' | 'saved'>('discover');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [result, categoryList] = await Promise.all([api.listRecipes({ q: query, category: category === 'all' ? undefined : category }), api.listRecipeCategories()]);
      setRecipes(result.recipes);
      setCategories(categoryList);
      setError('');
      const visible = tab === 'saved' ? result.recipes.filter((recipe) => savedIds.includes(recipe.id)) : result.recipes;
      setStatus(visible.length ? 'data' : 'empty');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Recipes are temporarily unavailable.');
      setStatus('error');
    }
  }, [query, category, tab, savedIds]);

  useEffect(() => { void load(); }, [load]);
  const visibleRecipes = tab === 'saved' ? recipes.filter((recipe) => savedIds.includes(recipe.id)) : recipes;

  return <div className="page-stack">
    <PageIntro eyebrow="A little inspiration" title="Recipes for real life." body="Curated ideas for everyday cooking, from quick lunches to a slower Sunday supper." />
    <TabList selectedValue={tab} onTabSelect={(_, data) => setTab(String(data.value) as 'discover' | 'saved')} className="recipe-tabs">
      <Tab value="discover" icon={<BookOpenRegular />}>Discover</Tab><Tab value="saved" icon={<BookmarkRegular />}>Saved ({savedIds.length})</Tab>
    </TabList>
    {tab === 'discover' && <>
      <div className="recipe-tools"><Field label="Search recipes"><Input contentBefore={<SearchRegular />} value={query} onChange={(_, data) => setQuery(data.value)} placeholder="Try chickpeas, soup, or salmon" /></Field>
        <div className="category-row" aria-label="Filter by category"><Button appearance={category === 'all' ? 'primary' : 'secondary'} onClick={() => setCategory('all')}>All</Button>{categories.map((item) => <Button key={item} appearance={category === item ? 'primary' : 'secondary'} onClick={() => setCategory(item)}>{item}</Button>)}</div>
      </div>
      <SectionHeading title="Discover recipes" detail={`${recipes.length} curated recipes`} icon={<FoodRegular />} />
    </>}
    {tab === 'saved' && <SectionHeading title="Saved recipes" detail={`${visibleRecipes.length} saved`} icon={<BookmarkRegular />} />}
    <DataState status={status} error={error} onRetry={() => void load()} emptyTitle={tab === 'saved' ? 'No saved recipes yet' : 'No recipes found'} emptyBody={tab === 'saved' ? 'Save a recipe while you browse and it will be easy to find here next time.' : 'Try another search or clear your category filter.'} emptyAction={tab === 'saved' ? <Button appearance="primary" onClick={() => setTab('discover')}>Browse recipes</Button> : <Button appearance="secondary" onClick={() => { setQuery(''); setCategory('all'); }}>Clear filters</Button>}>
      <div className="recipe-grid">{visibleRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
    </DataState>
  </div>;
}

function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return <Card className="recipe-card"><Link to={`/recipes/${recipe.id}`} className="recipe-image-link" aria-label={`View ${recipe.name}`}><img className="recipe-image" src={recipe.imageUrl} alt={recipe.name} loading="lazy" /><span className="image-label">{recipe.categories[0]}</span></Link>
    <div className="recipe-card-body"><div className="recipe-category-line">{recipe.categories.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div><h3>{recipe.name}</h3><Text>{recipe.description}</Text><div className="recipe-meta"><span><ClockRegular />{recipe.prepMinutes} min</span><span>{recipe.servings} servings</span></div><div className="recipe-card-actions"><Button as="a" href={`/recipes/${recipe.id}`} appearance="primary" icon={<BookOpenRegular />}>View recipe</Button><a className="resource-link" href={recipe.shortUrl || undefined} target={recipe.shortUrl ? "_blank" : undefined} rel={recipe.shortUrl ? "noreferrer" : undefined} aria-disabled={!recipe.shortUrl}><VideoRegular /> Short</a></div></div>
  </Card>;
}

export function RecipeDetailPage() {
  const { recipeId = '' } = useParams();
  const { savedIds, toggleSaved } = useApp();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const [videoFailed, setVideoFailed] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await api.getRecipe(recipeId);
      setRecipe(result);
      setStatus(result ? 'data' : 'empty');
      setError('');
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'This recipe is temporarily unavailable.'); setStatus('error'); }
  }, [recipeId]);
  useEffect(() => { void load(); setVideoFailed(false); }, [load]);

  if (status === 'loading' || status === 'error') return <div className="page-stack"><DataState status={status} error={error} onRetry={() => void load()} emptyTitle="Recipe not found" emptyBody="Choose another recipe from the collection." /></div>;
  if (!recipe) return <div className="page-stack"><DataState status="empty" onRetry={() => void load()} emptyTitle="Recipe not found" emptyBody="Choose another recipe from the collection." /></div>;

  return <div className="page-stack detail-layout">
    <article className="detail-main">
      <Link to="/recipes" className="back-link">Recipes / <span>{recipe.categories[0]}</span></Link>
      <Text className="eyebrow">Recipe · {recipe.categories[1] ?? recipe.categories[0]}</Text>
      <h1 className="detail-title">{recipe.name}</h1><p className="detail-description">{recipe.description}</p>
      <div className="detail-meta"><span><ClockRegular />{recipe.prepMinutes} min</span><span><FoodRegular />{recipe.servings} servings</span></div>
      <div className="tag-row">{recipe.categories.map((item) => <span className="recipe-tag" key={item}>{item}</span>)}</div>
      <Button appearance={savedIds.includes(recipe.id) ? 'secondary' : 'primary'} icon={<BookmarkRegular />} onClick={() => toggleSaved(recipe.id)}>{savedIds.includes(recipe.id) ? 'Remove saved recipe' : 'Save recipe'}</Button>
      <div className="detail-photo"><img src={recipe.imageUrl} alt={recipe.name} /></div>
      <section className="detail-section"><SectionHeading title="Ingredients" detail={`${recipe.ingredients.length} ingredients`} icon={<FoodRegular />} /><Card className="ingredient-card"><ul className="ingredient-list">{recipe.ingredients.map((ingredient) => <li key={ingredient}><span className="ingredient-check" />{ingredient}</li>)}</ul></Card></section>
      <section className="detail-section"><SectionHeading title="Preparation steps" detail={`${recipe.steps.length} steps`} icon={<BookOpenRegular />} /><ol className="step-list">{recipe.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol></section>
    </article>
    <aside className="detail-aside" aria-label="Recipe cooking resources">
      <Card className="video-card"><SectionHeading title="Cooking guide" icon={<VideoRegular />} />
        {recipe.videoEmbedUrl ? (videoFailed ? <div className="video-unavailable"><VideoRegular fontSize={40} /><strong>Cooking video is temporarily unavailable</strong><Text>Retry reloads the publisher embed.</Text><Button appearance="secondary" onClick={() => setVideoFailed(false)}>Retry video</Button></div> : <div className="video-frame"><iframe title={`${recipe.name} cooking video`} src={recipe.videoEmbedUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" onError={() => setVideoFailed(true)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>) : <div className="guide-placeholder"><VideoRegular fontSize={34} /><strong>Quick video guide</strong><Text>This recipe has a publisher guide plus a Shorts search link.</Text><a className="resource-link resource-link-large" href={recipe.shortUrl} target="_blank" rel="noreferrer"><VideoRegular /> Find a short</a></div>}
        <div className="detail-resources"><a className="publisher-link" href={recipe.sourceUrl} target="_blank" rel="noreferrer"><LinkRegular /> Guidelines: {recipe.sourceName}</a>{recipe.shortUrl && <a className="publisher-link" href={recipe.shortUrl} target="_blank" rel="noreferrer"><VideoRegular /> Watch recipe Shorts</a>}</div>
      </Card>
    </aside>
  </div>;
}