export function getLocalModelStatus(){
  const endpoint=process.env.LOCAL_LLM_BASE_URL;
  if(!endpoint) return {provider:'none',status:'not_configured',paidFallback:false};
  try {
    const url=new URL(endpoint);
    if(!['http:','https:'].includes(url.protocol)) throw new Error('invalid protocol');
    return {provider:'llama.cpp-compatible',status:'configured',paidFallback:false};
  } catch {
    return {provider:'none',status:'invalid_configuration',paidFallback:false};
  }
}
