const API=import.meta.env.VITE_API_URL||'http://localhost:3001';
export type ServerProduct={id:string;name:string;brand:string;store:string;calories:string;protein:string;fat:string;carbs:string;additives:string;recommendation:string;image_url:string|null};
export async function fetchProducts():Promise<ServerProduct[]>{const r=await fetch(API+'/api/products');if(!r.ok)throw new Error('Unable to load product catalog');return r.json()}
export async function healthcheck():Promise<boolean>{try{const r=await fetch(API+'/health');return r.ok}catch{return false}}

export type ProductInput={name:string;brand:string;store:'Rimi'|'Maxima'|'Lidl'|'Other';calories:number;protein:number;fat:number;carbs:number;additives:string;ingredients:string;recommendation:'Neitrāls'|'Neieteicams'|'Ļoti ieteicams';image_url?:string|null;source_url?:string|null};
export async function createCatalogProduct(input:ProductInput,key:string):Promise<ServerProduct>{const r=await fetch(API+'/api/admin/products',{method:'POST',headers:{'Content-Type':'application/json','x-admin-key':key},body:JSON.stringify(input)});if(!r.ok){const body=await r.json().catch(()=>({}));throw new Error(r.status===403?'Invalid administrator key':body.error||'Unable to save product')}return r.json()}
export async function deleteCatalogProduct(id:number,key:string):Promise<void>{const r=await fetch(API+'/api/admin/products/'+id,{method:'DELETE',headers:{'x-admin-key':key}});if(!r.ok)throw new Error(r.status===403?'Invalid administrator key':'Unable to delete product')}
export async function exportCatalog(key:string):Promise<void>{const r=await fetch(API+'/api/admin/export',{headers:{'x-admin-key':key}});if(!r.ok)throw new Error(r.status===403?'Invalid administrator key':'Export failed');const blob=await r.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='grozcalc-products.json';a.click();URL.revokeObjectURL(url)}

const devIdKey='gc-dev-profile-id';
export function devProfileId():string{let id=localStorage.getItem(devIdKey);if(!id){id='dev_'+crypto.randomUUID().replaceAll('-','');localStorage.setItem(devIdKey,id)}return id}
async function diaryRequest(path:string,init?:RequestInit){const r=await fetch(API+path,{...init,headers:{'x-dev-user-id':devProfileId(),...(init?.body?{'Content-Type':'application/json'}:{}),...init?.headers}});if(!r.ok)throw new Error('Diary database request failed ('+r.status+')');return r.status===204?null:r.json()}
export type SqlDiaryEntry={id:string;product_id:string;entry_date:string;grams:string};
export async function fetchDiary():Promise<SqlDiaryEntry[]>{return diaryRequest('/api/diary')}
export async function addDiary(productId:number,date:string,grams:number):Promise<SqlDiaryEntry>{return diaryRequest('/api/diary',{method:'POST',body:JSON.stringify({product_id:productId,entry_date:date,grams})})}
export async function updateDiary(id:number,grams:number):Promise<SqlDiaryEntry>{return diaryRequest('/api/diary/'+id,{method:'PATCH',body:JSON.stringify({grams})})}
export async function removeDiary(id:number):Promise<void>{await diaryRequest('/api/diary/'+id,{method:'DELETE'})}
export async function fetchList(kind:'favorite'|'blacklist'):Promise<number[]>{return diaryRequest('/api/lists/'+kind)}
export async function setListItem(kind:'favorite'|'blacklist',id:number,enabled:boolean):Promise<void>{await diaryRequest('/api/lists/'+kind+'/'+id,{method:enabled?'PUT':'DELETE'})}
