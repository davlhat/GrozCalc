import 'dotenv/config';
import{readFile}from'node:fs/promises';
import{Pool}from'pg';
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const schema=new URL('../sql/schema.sql',import.meta.url);
const catalog=new URL('../../data/sourced-products.json',import.meta.url);
const client=await pool.connect();
try{
 await client.query('BEGIN');
 await client.query(await readFile(schema,'utf8'));
 await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_key TEXT UNIQUE`);
 await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated BOOLEAN NOT NULL DEFAULT FALSE`);
 await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS estimate_basis TEXT`);
 await client.query(`CREATE TABLE IF NOT EXISTS catalog_seed_history(catalog_key TEXT PRIMARY KEY, seeded_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
 const items=JSON.parse(await readFile(catalog,'utf8'));
 let inserted=0;
 for(let i=0;i<items.length;i++){
  const p=items[i],key='retailer-v1-'+String(i+1).padStart(3,'0');
  const claimed=await client.query('INSERT INTO catalog_seed_history(catalog_key) VALUES($1) ON CONFLICT DO NOTHING RETURNING catalog_key',[key]);
  if(!claimed.rowCount)continue;
  await client.query(`INSERT INTO products(name,brand,store,calories,protein,fat,carbs,additives,ingredients,recommendation,source_url,verified,catalog_key,estimated,estimate_basis)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,[p.name,p.brand||'',p.store,p.calories,p.protein,p.fat,p.carbs,p.additives||'',p.ingredients||'',p.recommendation||'Neitrāls',p.source_url||null,false,key,p.estimate===true,p.estimate_basis||null]);
  inserted++;
 }
 await client.query('COMMIT');
 console.log('Database initialized; retailer products newly imported: '+inserted+' / '+items.length);
}catch(e){await client.query('ROLLBACK');throw e}finally{client.release();await pool.end()}
