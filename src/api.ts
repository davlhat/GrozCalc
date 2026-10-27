const API=import.meta.env.VITE_API_URL||'http://localhost:3001';
export type ServerProduct={id:string;name:string;brand:string;store:string;calories:string;protein:string;fat:string;carbs:string;additives:string;recommendation:string;image_url:string|null};
export async function fetchProducts():Promise<ServerProduct[]>{const r=await fetch(API+'/api/products');if(!r.ok)throw new Error('Unable to load product catalog');return r.json()}
export async function healthcheck():Promise<boolean>{try{const r=await fetch(API+'/health');return r.ok}catch{return false}}
