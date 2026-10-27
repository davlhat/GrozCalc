CREATE TABLE IF NOT EXISTS products (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 name TEXT NOT NULL, brand TEXT NOT NULL DEFAULT '',
 store TEXT NOT NULL CHECK(store IN ('Rimi','Maxima','Lidl','Other')),
 calories NUMERIC(10,2) NOT NULL CHECK(calories>=0),
 protein NUMERIC(10,2) NOT NULL CHECK(protein>=0),
 fat NUMERIC(10,2) NOT NULL CHECK(fat>=0),
 carbs NUMERIC(10,2) NOT NULL CHECK(carbs>=0),
 additives TEXT NOT NULL DEFAULT '',
 ingredients TEXT NOT NULL DEFAULT '',
 image_url TEXT,
 recommendation TEXT NOT NULL DEFAULT 'Neitrāls' CHECK(recommendation IN ('Neitrāls','Neieteicams','Ļoti ieteicams')),
 source_url TEXT, verified BOOLEAN NOT NULL DEFAULT FALSE,
 owner_id TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS diary_entries(
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id TEXT NOT NULL,
 product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 entry_date DATE NOT NULL,
 grams NUMERIC(10,2) NOT NULL CHECK(grams>0)
);
CREATE TABLE IF NOT EXISTS user_product_lists(
 user_id TEXT NOT NULL, product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('favorite','blacklist')),
 PRIMARY KEY(user_id,product_id,kind)
);
CREATE TABLE IF NOT EXISTS goal_presets(
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id TEXT,
 name TEXT NOT NULL,
 calories INTEGER NOT NULL CHECK(calories>0),
 protein INTEGER NOT NULL CHECK(protein>=0),
 fat INTEGER NOT NULL CHECK(fat>=0),
 carbs INTEGER NOT NULL CHECK(carbs>=0),
 is_system BOOLEAN NOT NULL DEFAULT FALSE
);
INSERT INTO goal_presets(name,calories,protein,fat,carbs,is_system)
SELECT v.name,v.calories,v.protein,v.fat,v.carbs,TRUE FROM
(VALUES ('Maintenance',2700,160,90,310),('Weight loss',2300,160,75,240),('Muscle gain',3000,180,100,350))
AS v(name,calories,protein,fat,carbs)
WHERE NOT EXISTS(SELECT 1 FROM goal_presets WHERE is_system=TRUE AND name=v.name);

-- Accounts and opaque, revocable server-side sessions.
CREATE TABLE IF NOT EXISTS app_users (
 id UUID PRIMARY KEY,
 email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app_sessions (
 token_hash TEXT PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_sessions_expires_at_idx ON app_sessions(expires_at);

CREATE TABLE IF NOT EXISTS user_settings (
 user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
 calories INTEGER NOT NULL DEFAULT 2700 CHECK(calories BETWEEN 1 AND 20000),
 protein INTEGER NOT NULL DEFAULT 160 CHECK(protein BETWEEN 0 AND 2000),
 fat INTEGER NOT NULL DEFAULT 90 CHECK(fat BETWEEN 0 AND 2000),
 carbs INTEGER NOT NULL DEFAULT 310 CHECK(carbs BETWEEN 0 AND 2000),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_custom_products (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 name TEXT NOT NULL,
 brand TEXT NOT NULL DEFAULT '',
 store TEXT NOT NULL DEFAULT 'Other' CHECK(store IN ('Rimi','Maxima','Lidl','Other')),
 calories NUMERIC(10,2) NOT NULL CHECK(calories>=0),
 protein NUMERIC(10,2) NOT NULL CHECK(protein>=0),
 fat NUMERIC(10,2) NOT NULL CHECK(fat>=0),
 carbs NUMERIC(10,2) NOT NULL CHECK(carbs>=0),
 additives TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS user_custom_products_user_idx ON user_custom_products(user_id);

-- Account-owned foods can be logged independently of the shared catalog.
CREATE TABLE IF NOT EXISTS personal_diary_entries (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 product_id BIGINT NOT NULL REFERENCES user_custom_products(id) ON DELETE CASCADE,
 entry_date DATE NOT NULL,
 grams NUMERIC(10,2) NOT NULL CHECK(grams>0)
);
CREATE INDEX IF NOT EXISTS personal_diary_user_date_idx ON personal_diary_entries(user_id,entry_date);
CREATE INDEX IF NOT EXISTS goal_presets_user_idx ON goal_presets(user_id);
