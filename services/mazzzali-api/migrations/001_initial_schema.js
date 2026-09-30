export const up = (pgm) => pgm.sql(`
  CREATE TABLE users (
    id uuid PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    focus text NOT NULL CHECK (focus IN ('weight-loss', 'healthy-tasty-eating')),
    categories text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_categories_check CHECK (
      categories <@ ARRAY[
        'Quick & Easy', 'High Protein', 'Vegetarian', 'Vegan',
        'Mediterranean', 'Gluten-Free', 'Budget-Friendly', 'Desserts'
      ]::text[]
    )
  );

  CREATE TABLE goals (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    starting_weight double precision NOT NULL CHECK (starting_weight > 0),
    target_weight double precision NOT NULL CHECK (target_weight > 0),
    weight_unit text NOT NULL CHECK (weight_unit IN ('kg', 'lb')),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE recipes (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    categories text[] NOT NULL DEFAULT '{}',
    prep_minutes integer NOT NULL CHECK (prep_minutes > 0),
    servings integer NOT NULL CHECK (servings > 0),
    image_url text NOT NULL,
    ingredients text[] NOT NULL,
    steps text[] NOT NULL,
    source_name text NOT NULL,
    source_url text NOT NULL,
    video_embed_url text NOT NULL,
    CONSTRAINT recipes_categories_check CHECK (
      categories <@ ARRAY[
        'Quick & Easy', 'High Protein', 'Vegetarian', 'Vegan',
        'Mediterranean', 'Gluten-Free', 'Budget-Friendly', 'Desserts'
      ]::text[]
    )
  );

  CREATE INDEX recipes_categories_idx ON recipes USING GIN (categories);
  CREATE INDEX recipes_name_idx ON recipes (name);
`);

export const down = (pgm) => pgm.sql(`
  DROP TABLE recipes;
  DROP TABLE goals;
  DROP TABLE users;
`);