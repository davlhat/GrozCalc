const API=import.meta.env.VITE_API_URL||'http://localhost:3001';
export type ServerProduct={id:string;name:string;brand:string;store:string;calories:string;protein:string;fat:string;carbs:string;additives:string;recommendation:string;image_url:string|null;source_url?:string|null;verified?:boolean};
export async function fetchProducts():Promise<ServerProduct[]>{const r=await fetch(API+'/api/products',{credentials:'include'});if(!r.ok)throw new Error('Unable to load product catalog');return r.json()}
export async function healthcheck():Promise<boolean>{try{const r=await fetch(API+'/health');return r.ok}catch{return false}}

export type ProductInput={name:string;brand:string;store:'Rimi'|'Maxima'|'Lidl'|'Other';calories:number;protein:number;fat:number;carbs:number;additives:string;ingredients:string;recommendation:'Neitrāls'|'Neieteicams'|'Ļoti ieteicams';image_url?:string|null;source_url?:string|null};
export async function createCatalogProduct(input:ProductInput,key:string):Promise<ServerProduct>{const r=await fetch(API+'/api/admin/products',{credentials:'include',method:'POST',headers:{'Content-Type':'application/json','x-admin-key':key},body:JSON.stringify(input)});if(!r.ok){const body=await r.json().catch(()=>({}));throw new Error(r.status===403?'Invalid administrator key':body.error||'Unable to save product')}return r.json()}
export async function deleteCatalogProduct(id:number,key:string):Promise<void>{const r=await fetch(API+'/api/admin/products/'+id,{credentials:'include',method:'DELETE',headers:{'x-admin-key':key}});if(!r.ok)throw new Error(r.status===403?'Invalid administrator key':'Unable to delete product')}
export async function exportCatalog(key:string):Promise<void>{const r=await fetch(API+'/api/admin/export',{credentials:'include',headers:{'x-admin-key':key}});if(!r.ok)throw new Error(r.status===403?'Invalid administrator key':'Export failed');const blob=await r.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='grozcalc-products.json';a.click();URL.revokeObjectURL(url)}

const devIdKey='gc-dev-profile-id';
export function devProfileId():string{let id=localStorage.getItem(devIdKey);if(!id){id='dev_'+crypto.randomUUID().replaceAll('-','');localStorage.setItem(devIdKey,id)}return id}
async function diaryRequest(path:string,init?:RequestInit){const r=await fetch(API+path,{credentials:'include',...init,headers:{'x-dev-user-id':devProfileId(),...(init?.body?{'Content-Type':'application/json'}:{}),...init?.headers}});if(!r.ok)throw new Error('Diary database request failed ('+r.status+')');return r.status===204?null:r.json()}
export type SqlDiaryEntry={id:string;product_id:string;entry_date:string;grams:string};
export async function fetchDiary():Promise<SqlDiaryEntry[]>{return diaryRequest('/api/diary')}
export async function addDiary(productId:number,date:string,grams:number):Promise<SqlDiaryEntry>{return diaryRequest('/api/diary',{method:'POST',body:JSON.stringify({product_id:productId,entry_date:date,grams})})}
export async function updateDiary(id:number,grams:number):Promise<SqlDiaryEntry>{return diaryRequest('/api/diary/'+id,{method:'PATCH',body:JSON.stringify({grams})})}
export async function removeDiary(id:number):Promise<void>{await diaryRequest('/api/diary/'+id,{method:'DELETE'})}
export async function fetchList(kind:'favorite'|'blacklist'):Promise<number[]>{return diaryRequest('/api/lists/'+kind)}
export async function setListItem(kind:'favorite'|'blacklist',id:number,enabled:boolean):Promise<void>{await diaryRequest('/api/lists/'+kind+'/'+id,{method:enabled?'PUT':'DELETE'})}

/** Local-development image upload; requires the same admin key as product creation. */
export async function uploadCatalogImage(file:File,key:string):Promise<string>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Select a PNG, JPEG or WebP image');
 if(file.size>3*1024*1024)throw new Error('Image must be smaller than 3 MB');
 const r=await fetch(API+'/api/admin/upload',{credentials:'include',method:'POST',headers:{'x-admin-key':key,'Content-Type':file.type},body:file});
 const body=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(body.error||'Image upload failed ('+r.status+')');
 return new URL(body.image_url,API).href;
}

export type Account={id:string;email:string;role:'user'|'admin'};
export async function currentAccount():Promise<Account|null>{const r=await fetch(API+'/api/auth/me',{credentials:'include'});if(!r.ok)throw new Error('Account check failed');return (await r.json()).user}
export async function accountAction(action:'login'|'register',email:string,password:string):Promise<Account>{const r=await fetch(API+'/api/auth/'+action,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.error||'Authentication failed');return body}
export async function signOut():Promise<void>{const r=await fetch(API+'/api/auth/logout',{method:'POST',credentials:'include'});if(!r.ok)throw new Error('Unable to sign out')}

export type NutritionGoals={calories:number;protein:number;fat:number;carbs:number};
export async function getAccountGoals():Promise<NutritionGoals|null>{
 const r=await fetch(API+'/api/me/goals',{credentials:'include'});
 if(!r.ok)throw new Error('Unable to load account goals ('+r.status+')');
 return r.json();
}
export async function saveAccountGoals(goals:NutritionGoals):Promise<NutritionGoals>{
 const r=await fetch(API+'/api/me/goals',{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(goals)});
 const body=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(body.error||'Unable to save goals ('+r.status+')');
 return body;
}
export type PersonalProduct={id:string;name:string;brand:string;store:string;calories:string;protein:string;fat:string;carbs:string;additives:string};
export async function getPersonalProducts():Promise<PersonalProduct[]>{
 const r=await fetch(API+'/api/me/products',{credentials:'include'});
 if(!r.ok)throw new Error('Unable to load personal products ('+r.status+')');
 return r.json();
}
export async function createPersonalProduct(p:Omit<PersonalProduct,'id'>):Promise<PersonalProduct>{
 const r=await fetch(API+'/api/me/products',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({...p,calories:Number(p.calories),protein:Number(p.protein),fat:Number(p.fat),carbs:Number(p.carbs)})});
 const body=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(body.error||'Unable to create personal product');
 return body;
}
export async function deletePersonalProduct(id:number):Promise<void>{
 const r=await fetch(API+'/api/me/products/'+id,{method:'DELETE',credentials:'include'});
 if(!r.ok)throw new Error('Unable to delete personal product ('+r.status+')');
}

export type PersonalDiaryEntry={id:string;product_id:string;entry_date:string;grams:string};
async function accountRequest<T>(path:string,init?:RequestInit):Promise<T>{
 const r=await fetch(API+path,{credentials:'include',...init,headers:{...(init?.body?{'Content-Type':'application/json'}:{}),...init?.headers}});
 if(r.status===204)return undefined as T;
 const body=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(body.error||'Account request failed ('+r.status+')');
 return body as T;
}
export const getPersonalDiary=()=>accountRequest<PersonalDiaryEntry[]>('/api/me/diary');
export const addPersonalDiary=(product_id:number,entry_date:string,grams:number)=>accountRequest<PersonalDiaryEntry>('/api/me/diary',{method:'POST',body:JSON.stringify({product_id,entry_date,grams})});
export const editPersonalDiary=(id:number,grams:number)=>accountRequest<PersonalDiaryEntry>('/api/me/diary/'+id,{method:'PATCH',body:JSON.stringify({grams})});
export const removePersonalDiary=(id:number)=>accountRequest<void>('/api/me/diary/'+id,{method:'DELETE'});
export type SavedPreset=NutritionGoals&{id:number;name:string};
export const getSavedPresets=()=>accountRequest<SavedPreset[]>('/api/me/presets');
export const createSavedPreset=(preset:Omit<SavedPreset,'id'>)=>accountRequest<SavedPreset>('/api/me/presets',{method:'POST',body:JSON.stringify(preset)});
export const removeSavedPreset=(id:number)=>accountRequest<void>('/api/me/presets/'+id,{method:'DELETE'});

export type CollectionItem={source:'demo'|'catalog'|'personal';product_id:string;kind:'favorite'|'blacklist'};
export const getCollections=()=>accountRequest<CollectionItem[]>('/api/me/collections');
export const changeCollection=(kind:'favorite'|'blacklist',source:CollectionItem['source'],id:number,enabled:boolean)=>accountRequest<void>('/api/me/collections/'+kind+'/'+source+'/'+id,{method:enabled?'PUT':'DELETE'});

export async function updateCatalogProduct(id:number,changes:Partial<ProductInput>&{verified?:boolean},key=''):Promise<ServerProduct>{
 const r=await fetch(API+'/api/admin/products/'+id,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json','x-admin-key':key},body:JSON.stringify(changes)});
 const body=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(body.error||'Product update failed ('+r.status+')');
 return body;
}
