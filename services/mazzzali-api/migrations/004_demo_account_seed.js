const DEMO_EMAIL = 'you@example.com';
const DEMO_PASSWORD_HASH = '$2b$12$gPOueDh1zUW8KjErDBAKeuRkE9g3L61AVAdbP.WjrRx91tTIJpEC2';
const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111';

export const up = (pgm) => pgm.sql(`
  INSERT INTO users (id, email, password_hash, display_name, focus, categories)
  VALUES (
    '${DEMO_USER_ID}',
    '${DEMO_EMAIL}',
    '${DEMO_PASSWORD_HASH}',
    'Demo User',
    'weight-loss',
    ARRAY['Quick & Easy', 'High Protein', 'Mediterranean']::text[]
  )
  ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    password_hash = EXCLUDED.password_hash,
    focus = EXCLUDED.focus,
    categories = EXCLUDED.categories,
    updated_at = NOW();

  INSERT INTO goals (user_id, starting_weight, target_weight, weight_unit, target_date)
  VALUES (
    '${DEMO_USER_ID}',
    90.0,
    82.0,
    'kg',
    DATE '2026-12-31'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    starting_weight = EXCLUDED.starting_weight,
    target_weight = EXCLUDED.target_weight,
    weight_unit = EXCLUDED.weight_unit,
    target_date = EXCLUDED.target_date,
    updated_at = NOW();
`);

export const down = (pgm) => pgm.sql(`
  DELETE FROM goals WHERE user_id = '${DEMO_USER_ID}';
  DELETE FROM users WHERE id = '${DEMO_USER_ID}' AND email = '${DEMO_EMAIL}';
`);
