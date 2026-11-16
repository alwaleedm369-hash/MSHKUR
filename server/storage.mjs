import { randomUUID, createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, nowIso } from './db.mjs';

const root=path.resolve(process.env.MSHKUR_STORAGE_DIR||'./storage');
fs.mkdirSync(root,{recursive:true});
const mimeToExt={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
const maxBytes=12*1024*1024;

export function storeImageDataUrl(dataUrl,{tenantId,userId}){
  const match=typeof dataUrl==='string'&&/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if(!match) throw Object.assign(new Error('Unsupported image data URL'),{code:'invalid_image'});
  const buffer=Buffer.from(match[2],'base64');
  if(!buffer.length||buffer.length>maxBytes) throw Object.assign(new Error('Image must be smaller than 12 MB'),{code:'image_too_large'});
  const signatureOk = match[1]==='image/png' ? buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : match[1]==='image/jpeg' ? buffer[0]===0xff&&buffer[1]===0xd8 : buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP';
  if(!signatureOk) throw Object.assign(new Error('Image content does not match its declared type'),{code:'invalid_image'});
  return storeImageBuffer(buffer,match[1],{tenantId,userId});
}
export function storeImageBuffer(buffer,mimeType,{tenantId,userId}){
  const ext=mimeToExt[mimeType];
  if(!ext||!Buffer.isBuffer(buffer)||buffer.length>maxBytes) throw Object.assign(new Error('Invalid image payload'),{code:'invalid_image'});
  const id=randomUUID(),storageKey=id+'.'+ext,sha256=createHash('sha256').update(buffer).digest('hex'),createdAt=nowIso();
  fs.writeFileSync(path.join(root,storageKey),buffer,{flag:'wx',mode:0o600});
  db.prepare('INSERT INTO files(id,tenant_id,user_id,storage_key,mime_type,size_bytes,sha256,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .run(id,tenantId,userId,storageKey,mimeType,buffer.length,sha256,createdAt);
  return {id,mimeType,sizeBytes:buffer.length,sha256,createdAt};
}
export function readImageFile(fileId,tenantId){
  if(typeof fileId!=='string'||!/^[0-9a-f-]{36}$/i.test(fileId)) throw Object.assign(new Error('File not found'),{code:'file_not_found'});
  const row=db.prepare('SELECT id,storage_key,mime_type,size_bytes,sha256 FROM files WHERE id=? AND tenant_id=?').get(fileId,tenantId);
  if(!row) throw Object.assign(new Error('File not found'),{code:'file_not_found'});
  const filePath=path.resolve(root,row.storage_key);
  if(path.dirname(filePath)!==root) throw Object.assign(new Error('Invalid storage key'),{code:'invalid_storage_key'});
  return {buffer:fs.readFileSync(filePath),file:row};
}
export function getFileForTenant(fileId,tenantId){
  return db.prepare('SELECT id,storage_key,mime_type,size_bytes,sha256 FROM files WHERE id=? AND tenant_id=?').get(fileId,tenantId)||null;
}
export function filePathForKey(storageKey){
  if(typeof storageKey!=='string'||!/^[0-9a-f-]{36}\.(png|jpg|webp)$/i.test(storageKey)) throw Object.assign(new Error('Invalid storage key'),{code:'invalid_storage_key'});
  const target=path.resolve(root,storageKey);
  if(path.dirname(target)!==root) throw Object.assign(new Error('Invalid storage key'),{code:'invalid_storage_key'});
  return target;
}
