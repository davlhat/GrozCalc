import 'dotenv/config';
import express from 'express';import cors from 'cors';import{Pool}from'pg';import{z}from'zod';
const app=express(),pool=new Pool({connectionString:process.env.DATABASE_URL});app.use(cors({origin:process.env.CORS_ORIGIN||'http://localhost:5173'}));app.use(express.json({limit:'100kb'}));
const product=z.object({name:z.string().trim().min(1).max(200),brand:z.string().default(''),store:z.enum(['Rimi','Maxima','Lidl','Other']),calories:z.number().nonnegative(),protein:z.number().nonnegative(),fat:z.number().nonnegative(),carbs:z.number().nonnegative(),additives:z.string().default(''),ingredients:z.string().default(''),image_url:z.string().url().nullable().optional(),recommendation:z.enum(['Neitrāls','Neieteicams','Ļoti ieteicams']).default('Neitrāls'),source_url:z.string().url().nullable().optional()});
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
function admin(req,res,next){if(!process.env.ADMIN_API_KEY||req.get('x-admin-key')!==process.env.ADMIN_API_KEY)return res.status(403).json({error:'Administrator key required'});next()}
app.get('/health',(_,res)=>res.json({ok:true}));
app.get('/api/products',wrap(async(req,res)=>{const search=String(req.query.search||'').slice(0,100),store=String(req.query.store||'');const r=await pool.query("SELECT * FROM products WHERE (name ILIKE $1 OR brand ILIKE $1) AND ($2='' OR store=$2) ORDER BY name LIMIT 250",['%'+search+'%',store]);res.json(r.rows)}));
app.post('/api/admin/products',admin,wrap(async(req,res)=>{const p=product.parse(req.body);const cols=Object.keys(p),vals=Object.values(p);const r=await pool.query('INSERT INTO products ('+cols.join(',')+') VALUES ('+cols.map((_,i)=>'$'+(i+1)).join(',')+') RETURNING *',vals);res.status(201).json(r.rows[0])}));
app.delete('/api/admin/products/:id',admin,wrap(async(req,res)=>{const r=await pool.query('DELETE FROM products WHERE id=$1 RETURNING id',[req.params.id]);res.status(r.rowCount?200:404).json(r.rowCount?{deleted:r.rows[0].id}:{error:'Not found'})}));
app.get('/api/admin/export',admin,wrap(async(_,res)=>{const r=await pool.query('SELECT * FROM products ORDER BY id');res.setHeader('Content-Disposition','attachment; filename="grozcalc-products.json"');res.json(r.rows)}));
app.use((err,req,res,next)=>{if(err instanceof z.ZodError)return res.status(400).json({error:'Invalid product',details:err.flatten()});console.error(err);res.status(500).json({error:'Internal server error'})});
app.listen(Number(process.env.PORT||3001),()=>console.log('GrozCalc API listening'));
