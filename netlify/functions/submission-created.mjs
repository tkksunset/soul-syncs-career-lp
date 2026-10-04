import {postToGas,SyncError} from '../../integrations/netlify/gas-client.mjs';
export function mapSubmission(payload) {
  if(!payload||typeof payload!=='object')throw new SyncError('INVALID_EVENT');
  const form=payload.form_name||payload.data?.['form-name'];
  if(form!=='career-consultation')return null;
  const data=payload.data;
  if(typeof payload.id!=='string'||!payload.id.trim()||!data||typeof data.name!=='string'||!data.name.trim()||typeof data.email!=='string'||!data.email.trim()||!/^\S+@\S+\.\S+$/.test(data.email)|| (data.message!=null&&typeof data.message!=='string'))throw new SyncError('MISSING_REQUIRED_DATA');
  return {id:payload.id,data:{name:data.name,email:data.email,message:data.message||''}};
}
export async function syncSubmission(payload,{env=process.env,fetchImpl=fetch,log=console.log}={}) {
  try {
    const submission=mapSubmission(payload);
    if(!submission)return {skipped:true};
    if(!env.GAS_WEB_APP_URL||!env.WEBHOOK_SECRET)throw new SyncError('CONFIG_ERROR');
    let url;try{url=new URL(env.GAS_WEB_APP_URL);}catch{throw new SyncError('CONFIG_ERROR');}
    url.searchParams.set('key',env.WEBHOOK_SECRET);
    const result=await postToGas(url.href,submission,{fetchImpl});
    if(result!=='OK'&&result!=='Already registered')throw new SyncError('GAS_UNEXPECTED_RESPONSE');
    log(JSON.stringify({component:'career-sheet-sync',code:result==='OK'?'SAVED':'ALREADY_REGISTERED'}));
    return {duplicate:result==='Already registered'};
  }catch(error){const code=error instanceof SyncError?error.code:'INTERNAL_ERROR';log(JSON.stringify({component:'career-sheet-sync',code}));throw new SyncError(code);}
}
// Official legacy platform event: Netlify validates its event signature before invocation.
export default async function handler(request) {
  let payload;
  try{({payload}=await request.json());}catch{console.log(JSON.stringify({component:'career-sheet-sync',code:'INVALID_EVENT'}));return new Response('Invalid event',{status:400});}
  try{await syncSubmission(payload);return new Response(null,{status:204});}
  catch{return new Response('Sheet synchronization failed',{status:500});}
}
