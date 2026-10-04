// Server-side only. Never include this module in browser bundles.
export class SyncError extends Error {
  constructor(code) { super(code); this.name='SyncError'; this.code=code; }
}
function allowed(url) {
  return url.protocol==='https:' && !url.username && !url.password &&
    ['script.google.com','script.googleusercontent.com'].includes(url.hostname);
}
export async function postToGas(url, payload, {fetchImpl=fetch, timeoutMs=15000}={}) {
  let target;
  try { target=new URL(url); } catch { throw new SyncError('CONFIG_ERROR'); }
  if(!allowed(target)||target.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(target.pathname))throw new SyncError('CONFIG_ERROR');
  const signal=AbortSignal.timeout(timeoutMs);
  let method='POST',body=JSON.stringify(payload),response;
  try {
    for(let redirects=0;redirects<=5;redirects++) {
      response=await fetchImpl(target,{method,body,headers:method==='POST'?{'Content-Type':'application/json'}:{},redirect:'manual',signal});
      if(![301,302,303,307,308].includes(response.status))break;
      if(redirects===5)throw new SyncError('GAS_REDIRECT_ERROR');
      const location=response.headers.get('location');
      if(!location)throw new SyncError('GAS_REDIRECT_ERROR');
      const next=new URL(location,target);
      if(!allowed(next))throw new SyncError('GAS_REDIRECT_ERROR');
      // ContentService serves the result at a one-time GET URL; never POST credentials there.
      if([301,302,303].includes(response.status)){method='GET';body=undefined;}
      else if(next.origin!==target.origin)throw new SyncError('GAS_REDIRECT_ERROR');
      target=next;
    }
    if([401,403].includes(response.status))throw new SyncError('GAS_AUTH_ERROR');
    if(!response.ok)throw new SyncError('GAS_HTTP_ERROR');
    const text=(await response.text()).trim();
    if(/^unauthorized\b/i.test(text))throw new SyncError('GAS_AUTH_ERROR');
    if(/^invalid data\b/i.test(text))throw new SyncError('GAS_INVALID_DATA');
    if(/^error\b/i.test(text))throw new SyncError('GAS_STORAGE_ERROR');
    // Parsing is deliberately separate from success policy; match existing GAS before deployment.
    return text;
  } catch(error) {
    if(error instanceof SyncError)throw error;
    throw new SyncError(signal.aborted?'GAS_TIMEOUT':'GAS_NETWORK_ERROR');
  }
}
