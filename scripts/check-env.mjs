import path from 'node:path';
const production=process.env.NODE_ENV==='production';
const errors=[];
const warnings=[];
if(production&&!process.env.APP_BASE_URL)errors.push('APP_BASE_URL is required in production.');
if(production&&(!process.env.MSHKUR_DB_PATH||!path.isAbsolute(process.env.MSHKUR_DB_PATH)))errors.push('MSHKUR_DB_PATH must be an absolute path on persistent storage.');
if(production&&(!process.env.MSHKUR_STORAGE_DIR||!path.isAbsolute(process.env.MSHKUR_STORAGE_DIR)))errors.push('MSHKUR_STORAGE_DIR must be an absolute path on persistent storage.');
if(production&&(!process.env.MSHKUR_BACKUP_DIR||!path.isAbsolute(process.env.MSHKUR_BACKUP_DIR)))warnings.push('MSHKUR_BACKUP_DIR must point to a separate absolute backup target; copy backups off-site.');
if(production&&process.env.TRUST_PROXY!=='1')warnings.push('TRUST_PROXY is not enabled; configure it only if a trusted reverse proxy is present.');
if(process.env.LOCAL_LLM_BASE_URL){
  try{
    const url=new URL(process.env.LOCAL_LLM_BASE_URL);
    const host=url.hostname.replace(/^\[|\]$/g,'');
    const privateName=host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal')||host.startsWith('127.')||host.startsWith('10.')||host.startsWith('192.168.')||/^172\.(1[6-9]|2\d|3[01])\./.test(host)||host==='::1';
    if(!privateName)errors.push('LOCAL_LLM_BASE_URL must point to a private local endpoint.');
  }catch{errors.push('LOCAL_LLM_BASE_URL is invalid.');}
}
for(const warning of warnings)console.warn('WARN:',warning);
if(errors.length){for(const error of errors)console.error('ERROR:',error);process.exit(1);}
console.log('Environment check complete. No secret values were printed.');
