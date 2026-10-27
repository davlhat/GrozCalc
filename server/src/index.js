import {randomBytes,scrypt as scryptCb,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import 'dotenv/config';
import express from 'express';import cors from 'cors';import{Pool}from'pg';import{z}from'zod';
const app=express(),pool=new Pool({connectionString:process.env.DATABASE_URL});app.use(cors({origin:process.env.CORS_ORIGIN||'http://localhost:5173',credentials:true}));app.use(express.json({limit:'100kb'}));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
const scrypt=promisify(scryptCb),cookieName='gc_session';
const origin=process.env.CORS_ORIGIN||'http://localhost:5173';
app.use((req,res,next)=>{if(['POST','PUT','PATCH','DELETE'].includes(req.method)&&req.get('origin')&&req.get('origin')!==origin)return res.status(403).json({error:'Invalid request origin'});next()});
function tokenHash(token){return createHash('sha256').update(token).digest('hex')}
async function passwordHash(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return salt+':'+key.toString('hex')}
async function passwordMatches(password,stored){try{const [salt,hex]=stored.split(':');const expected=Buffer.from(hex,'hex');const actual=await scrypt(password,salt,expected.length);return expected.length===actual.length&&timingSafeEqual(expected,actual)}catch{return false}}
function cookie(req){const raw=req.get('cookie')||'';return raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1)||''}
function setSessionCookie(res,token,maxAge){res.setHeader('Set-Cookie',cookieName+'='+token+'; HttpOnly; SameSite=Lax; Path=/; Max-Age='+maxAge+(process.env.NODE_ENV==='production'?'; Secure':''))}
async function sessionUser(req){const token=cookie(req);if(!/^[a-f0-9]{64}$/.test(token))return null;const r=await pool.query('SELECT u.id,u.email,u.role FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[tokenHash(token)]);return r.rows[0]||null}
async function issueSession(res,user){const token=randomBytes(32).toString('hex'),ttl=60*60*24*7;await pool.query("INSERT INTO app_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[tokenHash(token),user.id]);setSessionCookie(res,token,ttl);return {id:user.id,email:user.email,role:user.role}}
const credentials=z.object({email:z.string().trim().email().max(254).transform(x=>x.toLowerCase()),password:z.string().min(10).max(128)});
app.post('/api/auth/register',wrap(async(req,res)=>{const c=credentials.parse(req.body);const hash=await passwordHash(c.password);const role='user';try{const r=await pool.query('INSERT INTO app_users(id,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,email,role',[randomUUID(),c.email,hash,role]);res.status(201).json(await issueSession(res,r.rows[0]))}catch(e){if(e.code==='23505')return res.status(409).json({error:'Account already exists'});throw e}}));
app.post('/api/auth/login',wrap(async(req,res)=>{const c=credentials.parse(req.body);const r=await pool.query('SELECT id,email,role,password_hash FROM app_users WHERE email=$1',[c.email]);if(!r.rowCount||!await passwordMatches(c.password,r.rows[0].password_hash))return res.status(401).json({error:'Invalid email or password'});res.json(await issueSession(res,r.rows[0]))}));
app.get('/api/auth/me',wrap(async(req,res)=>res.json({user:await sessionUser(req)})));
app.post('/api/auth/logout',wrap(async(req,res)=>{const token=cookie(req);if(token)await pool.query('DELETE FROM app_sessions WHERE token_hash=$1',[tokenHash(token)]);setSessionCookie(res,'',0);res.status(204).end()}));

const product=z.object({name:z.string().trim().min(1).max(200),brand:z.string().default(''),store:z.enum(['Rimi','Maxima','Lidl','Other']),calories:z.number().nonnegative(),protein:z.number().nonnegative(),fat:z.number().nonnegative(),carbs:z.number().nonnegative(),additives:z.string().default(''),ingredients:z.string().default(''),image_url:z.string().url().nullable().optional(),recommendation:z.enum(['Neitrāls','Neieteicams','Ļoti ieteicams']).default('Neitrāls'),source_url:z.string().url().nullable().optional()});

function admin(req,res,next){wrap(async()=>{const user=await sessionUser(req);if(user?.role==='admin')return next();if(process.env.NODE_ENV!=='production'&&process.env.ADMIN_API_KEY&&req.get('x-admin-key')===process.env.ADMIN_API_KEY)return next();return res.status(403).json({error:'Administrator account required'})})(req,res,next)}
const uploadsDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../uploads');
app.use('/uploads',express.static(uploadsDir,{index:false,maxAge:'1d',setHeaders(res){res.setHeader('X-Content-Type-Options','nosniff')}}));
app.post('/api/admin/upload',admin,express.raw({type:['image/png','image/jpeg','image/webp'],limit:'3mb'}),wrap(async(req,res)=>{
 const data=req.body;
 if(!Buffer.isBuffer(data)||data.length<16)return res.status(400).json({error:'Upload a PNG, JPEG, or WebP image (max 3 MB)'});
 const png=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const jpg=data[0]===255&&data[1]===216&&data[2]===255;
 const webp=data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP';
 const mime=req.get('content-type')?.split(';')[0];
 const ext=png&&mime==='image/png'?'png':jpg&&mime==='image/jpeg'?'jpg':webp&&mime==='image/webp'?'webp':null;
 if(!ext)return res.status(415).json({error:'Invalid image format or content type'});
 await mkdir(uploadsDir,{recursive:true});
 const name=randomUUID()+'.'+ext;
 await writeFile(path.join(uploadsDir,name),data,{flag:'wx'});
 res.status(201).json({image_url:'/uploads/'+name});
}));

async function requireAccount(req,res,next){try{const user=await sessionUser(req);if(!user)return res.status(401).json({error:'Sign in required'});req.account=user;next()}catch(err){next(err)}}
const goalInput=z.object({calories:z.number().int().min(1).max(20000),protein:z.number().int().min(0).max(2000),fat:z.number().int().min(0).max(2000),carbs:z.number().int().min(0).max(2000)});
app.get('/api/me/goals',requireAccount,wrap(async(req,res)=>{
 const r=await pool.query('SELECT calories,protein,fat,carbs FROM user_settings WHERE user_id=$1',[req.account.id]);
 res.json(r.rows[0]||null);
}));
app.put('/api/me/goals',requireAccount,wrap(async(req,res)=>{
 const g=goalInput.parse(req.body);
 const r=await pool.query('INSERT INTO user_settings(user_id,calories,protein,fat,carbs) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET calories=excluded.calories,protein=excluded.protein,fat=excluded.fat,carbs=excluded.carbs,updated_at=now() RETURNING calories,protein,fat,carbs',[req.account.id,g.calories,g.protein,g.fat,g.carbs]);
 res.json(r.rows[0]);
}));
const customInput=z.object({name:z.string().trim().min(1).max(200),brand:z.string().max(200).default(''),store:z.enum(['Rimi','Maxima','Lidl','Other']).default('Other'),calories:z.number().nonnegative().max(10000),protein:z.number().nonnegative().max(1000),fat:z.number().nonnegative().max(1000),carbs:z.number().nonnegative().max(1000),additives:z.string().max(2000).default('')});
app.get('/api/me/products',requireAccount,wrap(async(req,res)=>{const r=await pool.query('SELECT id,name,brand,store,calories,protein,fat,carbs,additives FROM user_custom_products WHERE user_id=$1 ORDER BY id DESC LIMIT 500',[req.account.id]);res.json(r.rows)}));
app.post('/api/me/products',requireAccount,wrap(async(req,res)=>{const p=customInput.parse(req.body);const r=await pool.query('INSERT INTO user_custom_products(user_id,name,brand,store,calories,protein,fat,carbs,additives) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[req.account.id,p.name,p.brand,p.store,p.calories,p.protein,p.fat,p.carbs,p.additives]);res.status(201).json(r.rows[0])}));
app.delete('/api/me/products/:id',requireAccount,wrap(async(req,res)=>{const id=z.coerce.number().int().positive().parse(req.params.id);const r=await pool.query('DELETE FROM user_custom_products WHERE id=$1 AND user_id=$2 RETURNING id',[id,req.account.id]);res.status(r.rowCount?204:404).end()}));

const personalDiaryInput=z.object({product_id:z.coerce.number().int().positive(),entry_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),grams:z.number().positive().max(100000)});
app.get('/api/me/diary',requireAccount,wrap(async(req,res)=>{const r=await pool.query('SELECT id,product_id,entry_date::text,grams FROM personal_diary_entries WHERE user_id=$1 ORDER BY entry_date DESC,id DESC LIMIT 1000',[req.account.id]);res.json(r.rows)}));
app.post('/api/me/diary',requireAccount,wrap(async(req,res)=>{const d=personalDiaryInput.parse(req.body);const r=await pool.query('INSERT INTO personal_diary_entries(user_id,product_id,entry_date,grams) SELECT $1,p.id,$3,$4 FROM user_custom_products p WHERE p.id=$2 AND p.user_id=$1 RETURNING id,product_id,entry_date::text,grams',[req.account.id,d.product_id,d.entry_date,d.grams]);res.status(r.rowCount?201:404).json(r.rows[0]||{error:'Product not found'})}));
app.patch('/api/me/diary/:id',requireAccount,wrap(async(req,res)=>{const grams=z.number().positive().max(100000).parse(req.body.grams);const id=z.coerce.number().int().positive().parse(req.params.id);const r=await pool.query('UPDATE personal_diary_entries SET grams=$1 WHERE id=$2 AND user_id=$3 RETURNING id,product_id,entry_date::text,grams',[grams,id,req.account.id]);res.status(r.rowCount?200:404).json(r.rows[0]||{error:'Entry not found'})}));
app.delete('/api/me/diary/:id',requireAccount,wrap(async(req,res)=>{const id=z.coerce.number().int().positive().parse(req.params.id);const r=await pool.query('DELETE FROM personal_diary_entries WHERE id=$1 AND user_id=$2 RETURNING id',[id,req.account.id]);res.status(r.rowCount?204:404).end()}));
const presetInput=z.object({name:z.string().trim().min(1).max(50),calories:z.number().int().min(1).max(20000),protein:z.number().int().min(0).max(2000),fat:z.number().int().min(0).max(2000),carbs:z.number().int().min(0).max(2000)});
app.get('/api/me/presets',requireAccount,wrap(async(req,res)=>{const r=await pool.query('SELECT id,name,calories,protein,fat,carbs FROM goal_presets WHERE user_id=$1 AND is_system=FALSE ORDER BY id',[req.account.id]);res.json(r.rows)}));
app.post('/api/me/presets',requireAccount,wrap(async(req,res)=>{const p=presetInput.parse(req.body);const r=await pool.query('INSERT INTO goal_presets(user_id,name,calories,protein,fat,carbs,is_system) VALUES($1,$2,$3,$4,$5,$6,FALSE) RETURNING id,name,calories,protein,fat,carbs',[req.account.id,p.name,p.calories,p.protein,p.fat,p.carbs]);res.status(201).json(r.rows[0])}));
app.delete('/api/me/presets/:id',requireAccount,wrap(async(req,res)=>{const id=z.coerce.number().int().positive().parse(req.params.id);const r=await pool.query('DELETE FROM goal_presets WHERE id=$1 AND user_id=$2 AND is_system=FALSE RETURNING id',[id,req.account.id]);res.status(r.rowCount?204:404).end()}));

const collectionKind=z.enum(['favorite','blacklist']);
const collectionSource=z.enum(['demo','catalog','personal']);
const collectionId=z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER);
app.get('/api/me/collections',requireAccount,wrap(async(req,res)=>{
 const r=await pool.query('SELECT source,product_id,kind FROM account_product_lists WHERE user_id=$1 ORDER BY kind,source,product_id',[req.account.id]);
 res.json(r.rows);
}));
app.put('/api/me/collections/:kind/:source/:id',requireAccount,wrap(async(req,res)=>{
 const kind=collectionKind.parse(req.params.kind),source=collectionSource.parse(req.params.source),id=collectionId.parse(req.params.id);
 if(source==='demo'&&id>999999999)return res.status(400).json({error:'Invalid demo ID'});
 if(source!=='demo'){const table=source==='catalog'?'products':'user_custom_products';const owner=source==='personal'?' AND user_id=$2':'';const args=source==='personal'?[id,req.account.id]:[id];const found=await pool.query('SELECT id FROM '+table+' WHERE id=$1'+owner,args);if(!found.rowCount)return res.status(404).json({error:'Product not found'})}
 await pool.query('INSERT INTO account_product_lists(user_id,source,product_id,kind) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[req.account.id,source,id,kind]);
 res.status(204).end();
}));
app.delete('/api/me/collections/:kind/:source/:id',requireAccount,wrap(async(req,res)=>{
 const kind=collectionKind.parse(req.params.kind),source=collectionSource.parse(req.params.source),id=collectionId.parse(req.params.id);
 await pool.query('DELETE FROM account_product_lists WHERE user_id=$1 AND source=$2 AND product_id=$3 AND kind=$4',[req.account.id,source,id,kind]);res.status(204).end();
}));

app.get('/api/me/export',requireAccount,wrap(async(req,res)=>{
 const id=req.account.id;
 const [goals,products,diary,sharedDiary,collections,presets]=await Promise.all([
  pool.query('SELECT calories,protein,fat,carbs,updated_at FROM user_settings WHERE user_id=$1',[id]),
  pool.query('SELECT id,name,brand,store,calories,protein,fat,carbs,additives FROM user_custom_products WHERE user_id=$1',[id]),
  pool.query('SELECT id,product_id,entry_date::text,grams FROM personal_diary_entries WHERE user_id=$1',[id]),
  pool.query('SELECT id,product_id,entry_date::text,grams FROM diary_entries WHERE user_id=$1',[id]),
  pool.query('SELECT source,product_id,kind FROM account_product_lists WHERE user_id=$1',[id]),
  pool.query('SELECT id,name,calories,protein,fat,carbs FROM goal_presets WHERE user_id=$1 AND is_system=FALSE',[id])
 ]);
 res.setHeader('Content-Disposition','attachment; filename="grozcalc-my-data.json"');
 res.json({exported_at:new Date().toISOString(),format_version:1,goals:goals.rows[0]||null,products:products.rows,personal_diary:diary.rows,catalog_diary:sharedDiary.rows,collections:collections.rows,presets:presets.rows});
}));
app.get('/health',(_,res)=>res.json({ok:true}));
app.get('/api/products',wrap(async(req,res)=>{const search=String(req.query.search||'').slice(0,100),store=String(req.query.store||'');const r=await pool.query("SELECT * FROM products WHERE (name ILIKE $1 OR brand ILIKE $1) AND ($2='' OR store=$2) ORDER BY name LIMIT 250",['%'+search+'%',store]);res.json(r.rows)}));
app.post('/api/admin/products',admin,wrap(async(req,res)=>{const p=product.parse(req.body);const cols=Object.keys(p),vals=Object.values(p);const r=await pool.query('INSERT INTO products ('+cols.join(',')+') VALUES ('+cols.map((_,i)=>'$'+(i+1)).join(',')+') RETURNING *',vals);res.status(201).json(r.rows[0])}));

app.patch('/api/admin/products/:id',admin,wrap(async(req,res)=>{
 const id=z.coerce.number().int().positive().parse(req.params.id);
 const update=product.partial().extend({verified:z.boolean().optional()}).strict().parse(req.body);
 if(!Object.keys(update).length)return res.status(400).json({error:'No changes supplied'});
 const existing=await pool.query('SELECT source_url,verified FROM products WHERE id=$1',[id]);
 if(!existing.rowCount)return res.status(404).json({error:'Product not found'});
 const source=update.source_url===undefined?existing.rows[0].source_url:update.source_url;
 if(update.verified===true&&!source)return res.status(400).json({error:'A nutrition source URL is required before verification'});
 const cols=Object.keys(update),values=Object.values(update);
 const r=await pool.query('UPDATE products SET '+cols.map((k,i)=>k+'=$'+(i+1)).join(',')+' WHERE id=$'+(cols.length+1)+' RETURNING *',[...values,id]);
 res.json(r.rows[0]);
}));
app.delete('/api/admin/products/:id',admin,wrap(async(req,res)=>{const r=await pool.query('DELETE FROM products WHERE id=$1 RETURNING id',[req.params.id]);res.status(r.rowCount?200:404).json(r.rowCount?{deleted:r.rows[0].id}:{error:'Not found'})}));
app.get('/api/admin/export',admin,wrap(async(_,res)=>{const r=await pool.query('SELECT * FROM products ORDER BY id');res.setHeader('Content-Disposition','attachment; filename="grozcalc-products.json"');res.json(r.rows)}));

// Development-only diary API. Replace caller-provided user IDs with authenticated identity before deployment.
const diaryInput=z.object({product_id:z.coerce.number().int().positive(),entry_date:z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),grams:z.number().positive()});
function devUser(req,res,next){wrap(async()=>{const user=await sessionUser(req);if(user){req.devUser=user.id;return next()}if(process.env.NODE_ENV==='production')return res.status(401).json({error:'Sign in required'});const id=req.get('x-dev-user-id');if(!id||!/^[a-zA-Z0-9_-]{12,80}$/.test(id))return res.status(400).json({error:'A local development user ID is required'});req.devUser=id;next()})(req,res,next)}
app.get('/api/diary',devUser,wrap(async(req,res)=>{const r=await pool.query('SELECT id,product_id,entry_date::text,grams FROM diary_entries WHERE user_id=$1 ORDER BY entry_date DESC,id DESC LIMIT 1000',[req.devUser]);res.json(r.rows)}));
app.post('/api/diary',devUser,wrap(async(req,res)=>{const d=diaryInput.parse(req.body);const r=await pool.query('INSERT INTO diary_entries(user_id,product_id,entry_date,grams) VALUES($1,$2,$3,$4) RETURNING id,product_id,entry_date::text,grams',[req.devUser,d.product_id,d.entry_date,d.grams]);res.status(201).json(r.rows[0])}));
app.patch('/api/diary/:id',devUser,wrap(async(req,res)=>{const grams=z.number().positive().parse(req.body.grams);const r=await pool.query('UPDATE diary_entries SET grams=$1 WHERE id=$2 AND user_id=$3 RETURNING id,product_id,entry_date::text,grams',[grams,req.params.id,req.devUser]);res.status(r.rowCount?200:404).json(r.rows[0]||{error:'Not found'})}));
app.delete('/api/diary/:id',devUser,wrap(async(req,res)=>{const r=await pool.query('DELETE FROM diary_entries WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,req.devUser]);res.status(r.rowCount?200:404).json(r.rows[0]||{error:'Not found'})}));
app.get('/api/lists/:kind',devUser,wrap(async(req,res)=>{const kind=z.enum(['favorite','blacklist']).parse(req.params.kind);const r=await pool.query('SELECT product_id FROM user_product_lists WHERE user_id=$1 AND kind=$2',[req.devUser,kind]);res.json(r.rows.map(x=>x.product_id))}));
app.put('/api/lists/:kind/:productId',devUser,wrap(async(req,res)=>{const kind=z.enum(['favorite','blacklist']).parse(req.params.kind);await pool.query('INSERT INTO user_product_lists(user_id,kind,product_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[req.devUser,kind,req.params.productId]);res.status(204).end()}));
app.delete('/api/lists/:kind/:productId',devUser,wrap(async(req,res)=>{const kind=z.enum(['favorite','blacklist']).parse(req.params.kind);await pool.query('DELETE FROM user_product_lists WHERE user_id=$1 AND kind=$2 AND product_id=$3',[req.devUser,kind,req.params.productId]);res.status(204).end()}));
app.use((err,req,res,next)=>{if(err instanceof z.ZodError)return res.status(400).json({error:'Invalid product',details:err.flatten()});console.error(err);res.status(500).json({error:'Internal server error'})});
app.listen(Number(process.env.PORT||3001),()=>console.log('GrozCalc API listening'));
