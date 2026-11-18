import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { db } from '../server/db.mjs';

const sourceStorage=path.resolve(process.env.MSHKUR_STORAGE_DIR||'./storage');
const backupRoot=path.resolve(process.env.MSHKUR_BACKUP_DIR||'./backups');
const sourceDb=path.resolve(process.env.MSHKUR_DB_PATH||'./data/mshkur.sqlite');
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const backupName='mshkur-'+stamp+'-'+randomUUID().slice(0,8);
const partial=path.join(backupRoot,backupName+'.partial');
const destination=path.join(backupRoot,backupName);
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
const safeStoragePath=key=>{
  if(typeof key!=='string'||!/^[0-9a-f-]{36}\.(png|jpg|webp)$/i.test(key))throw new Error('Unsafe storage key in database snapshot');
  const target=path.resolve(sourceStorage,key);
  if(path.dirname(target)!==sourceStorage)throw new Error('Storage path escaped the configured root');
  return target;
};
let snapshot;
try{
  if(!fs.existsSync(sourceDb))throw new Error('Database file not found: '+sourceDb);
  fs.mkdirSync(partial,{recursive:true});
  const databaseBackup=path.join(partial,'mshkur.sqlite');
  await db.backup(databaseBackup);
  snapshot=new Database(databaseBackup,{readonly:true,fileMustExist:true});
  const integrity=snapshot.pragma('integrity_check').map(row=>row.integrity_check);
  if(integrity.some(result=>result!=='ok'))throw new Error('Backup database integrity check failed');
  const violations=snapshot.pragma('foreign_key_check');
  if(violations.length)throw new Error('Backup database contains foreign key violations: '+violations.length);
  const files=snapshot.prepare('SELECT storage_key,size_bytes,sha256 FROM files ORDER BY storage_key').all();
  const storageDestination=path.join(partial,'storage');
  fs.mkdirSync(storageDestination,{recursive:true});
  let totalBytes=0;
  for(const file of files){
    const from=safeStoragePath(file.storage_key);
    if(!fs.existsSync(from))throw new Error('Missing stored asset: '+file.storage_key);
    const bytes=fs.readFileSync(from);
    if(bytes.length!==file.size_bytes||sha256(bytes)!==file.sha256)throw new Error('Asset checksum/size mismatch: '+file.storage_key);
    fs.copyFileSync(from,path.join(storageDestination,file.storage_key),fs.constants.COPYFILE_EXCL);
    totalBytes+=bytes.length;
  }
  const dbBytes=fs.readFileSync(databaseBackup);
  const manifest={
    app:'MSHKUR OS',
    createdAt:new Date().toISOString(),
    database:{file:'mshkur.sqlite',sha256:sha256(dbBytes),sizeBytes:dbBytes.length},
    storage:{directory:'storage',fileCount:files.length,totalBytes},
    verification:{sqliteIntegrity:'ok',foreignKeyViolations:0,allAssetChecksumsVerified:true},
    note:'Copy this complete folder to separate off-site storage. Keep database and storage together.'
  };
  fs.writeFileSync(path.join(partial,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
  snapshot.close();snapshot=null;
  fs.renameSync(partial,destination);
  console.log(JSON.stringify({ok:true,backup:destination,manifest},null,2));
}catch(error){
  if(snapshot) snapshot.close();
  fs.rmSync(partial,{recursive:true,force:true});
  console.error('Backup failed:',error.message);
  process.exitCode=1;
}
