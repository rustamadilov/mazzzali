import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const shell = readFileSync(join(root,'services/mazzzali-web/src/components/AppShell.tsx'),'utf8');
const app = readFileSync(join(root,'services/mazzzali-web/src/App.tsx'),'utf8');
const dash = readFileSync(join(root,'services/mazzzali-web/src/pages/DashboardPage.tsx'),'utf8');
const css = readFileSync(join(root,'services/mazzzali-web/src/styles.css'),'utf8');
const required = [
  ['single theme toggle', (shell.match(/className="theme-toggle"/g)||[]).length === 1],
  ['no header theme duplicate', !shell.includes('className="topbar-theme"')],
  ['sun and moon icons', shell.includes('WeatherSunnyRegular') && shell.includes('WeatherMoonRegular')],
  ['theme resolved state', app.includes('isDark: boolean') && app.includes('isDark,')],
  ['metrics-first dashboard', dash.includes('metric-strip') && dash.includes('progress-ring') && dash.includes('Meal plan') && dash.includes('Quick actions')],
  ['mobile sidebar theme', css.includes('.sidebar-bottom { display:flex; flex-direction:row') && css.includes('.theme-toggle span { display:none; }')],
  ['production primary contrast', css.includes('background: linear-gradient(135deg, #2b7d5c, #17634a)')],
];
const migrationDir = join(root,'services/mazzzali-api/migrations');
const migrations = readdirSync(migrationDir);
required.push(['recipe seed migration', migrations.includes('003_recipe_library_seed.js')]);
required.push(['demo account migration', migrations.includes('004_demo_account_seed.js')]);
let failed=0;
for(const [name, ok] of required){ console.log(`${ok?'PASS':'FAIL'}  ${name}`); if(!ok) failed++; }
if(failed) process.exit(1);
