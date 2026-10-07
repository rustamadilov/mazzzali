export const up = (pgm) => pgm.sql(`
  ALTER TABLE users DROP CONSTRAINT users_focus_check;
  ALTER TABLE users ALTER COLUMN focus DROP NOT NULL;
  ALTER TABLE users ADD CONSTRAINT users_focus_check CHECK (
    focus IS NULL OR focus IN ('weight-loss', 'healthy-tasty-eating')
  );

  ALTER TABLE goals ADD COLUMN target_date date;
`);

export const down = (pgm) => pgm.sql(`
  ALTER TABLE goals DROP COLUMN target_date;

  UPDATE users SET focus = 'healthy-tasty-eating' WHERE focus IS NULL;
  ALTER TABLE users DROP CONSTRAINT users_focus_check;
  ALTER TABLE users ALTER COLUMN focus SET NOT NULL;
  ALTER TABLE users ADD CONSTRAINT users_focus_check CHECK (
    focus IN ('weight-loss', 'healthy-tasty-eating')
  );
`);