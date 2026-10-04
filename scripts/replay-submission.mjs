// Server-side recovery tool: payload arrives through stdin, never command arguments or logs.
import {syncSubmission} from '../netlify/functions/submission-created.mjs';
let input='';
try {
  for await(const chunk of process.stdin){input+=chunk;if(Buffer.byteLength(input)>1000000)throw new Error('too large');}
  let event;try{event=JSON.parse(input);}catch{throw new Error('invalid input');}
  await syncSubmission(event.payload||event);
}catch{console.error('REPLAY_FAILED');process.exitCode=1;}
