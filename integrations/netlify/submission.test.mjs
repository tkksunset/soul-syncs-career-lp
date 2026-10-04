import test from 'node:test';import assert from 'node:assert/strict';import {syncSubmission,mapSubmission} from '../../netlify/functions/submission-created.mjs';
const payload={id:'netlify-receipt-1',form_name:'career-consultation',data:{name:'テスト',email:'test@example.com',message:'相談'}};
const env={GAS_WEB_APP_URL:'https://script.google.com/macros/s/test/exec',WEBHOOK_SECRET:'private-test-secret'};
for(const result of ['OK','Already registered'])test('accept '+result,async()=>{const logs=[];await syncSubmission(payload,{env,log:x=>logs.push(x),fetchImpl:async(url,options)=>{assert.equal(new URL(url).searchParams.get('key'),env.WEBHOOK_SECRET);assert.deepEqual(JSON.parse(options.body),{id:payload.id,data:payload.data});return new Response(result);}});assert(!logs.join('').includes(env.WEBHOOK_SECRET));assert(!logs.join('').includes(payload.data.email));});
for(const [text,code] of [['Unauthorized','GAS_AUTH_ERROR'],['Invalid data','GAS_INVALID_DATA'],['Error','GAS_STORAGE_ERROR'],['<html>login</html>','GAS_UNEXPECTED_RESPONSE']])test('reject '+text,async()=>{await assert.rejects(syncSubmission(payload,{env,log:()=>{},fetchImpl:async()=>new Response(text)}),{code});});
test('stable receipt ID on replay',()=>assert.equal(mapSubmission(payload).id,mapSubmission(structuredClone(payload)).id));
test('skip different form without call',async()=>{assert.deepEqual(await syncSubmission({...payload,form_name:'other'},{fetchImpl:()=>{throw Error('must not call')}}),{skipped:true});});
test('missing ID fails; never generates a random ID',async()=>{await assert.rejects(syncSubmission({...payload,id:''},{env,log:()=>{}}),{code:'MISSING_REQUIRED_DATA'});});
test('missing env',async()=>{await assert.rejects(syncSubmission(payload,{env:{},log:()=>{}}),{code:'CONFIG_ERROR'});});
