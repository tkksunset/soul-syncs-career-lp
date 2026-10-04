// Script Properties: WEBHOOK_SECRET, SPREADSHEET_ID, AUTO_REPLY_REPLY_TO.
function gasReply_(text){return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);}
function emailAddress_(value){return typeof value==='string'&&/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(value);}
function sheet_(){var props=PropertiesService.getScriptProperties();var id=props.getProperty('SPREADSHEET_ID');var ss=id?SpreadsheetApp.openById(id):SpreadsheetApp.getActiveSpreadsheet();if(!ss)throw new Error('SHEET_UNAVAILABLE');var sheet=ss.getSheetByName('キャリア設計申込者管理');if(!sheet)throw new Error('SHEET_UNAVAILABLE');return sheet;}
function findReceiptRow_(sheet,id){var last=sheet.getLastRow();if(last<2)return 0;var rows=sheet.getRange(2,1,last-1,1).getDisplayValues();for(var i=0;i<rows.length;i++)if(rows[i][0]===id)return i+2;return 0;}
function asText_(value){value=String(value||'');return /^[\s]*[=+@-]/.test(value)?"'"+value:value;}
function doPost(e){
  var props=PropertiesService.getScriptProperties(),secret=props.getProperty('WEBHOOK_SECRET');
  if(!secret||!e||!e.parameter||e.parameter.key!==secret){console.log('GAS_AUTH_ERROR');return gasReply_('Unauthorized');}
  var payload;try{payload=JSON.parse(e.postData.contents);}catch(_){console.log('GAS_INVALID_DATA');return gasReply_('Invalid data');}
  if(!payload||typeof payload.id!=='string'||!payload.id.trim()||!payload.data||typeof payload.data.name!=='string'||!payload.data.name.trim()||!emailAddress_(payload.data.email)||(payload.data.message!=null&&typeof payload.data.message!=='string')){console.log('GAS_INVALID_DATA');return gasReply_('Invalid data');}
  var lock=LockService.getScriptLock(),acquired=false;
  try{
    acquired=lock.tryLock(20000);if(!acquired){console.log('GAS_LOCK_TIMEOUT');return gasReply_('Error');}
    var sheet=sheet_(),row=findReceiptRow_(sheet,payload.id);
    // Duplicate delivery never triggers another email, even for a failed/unknown prior attempt.
    if(row)return gasReply_('Already registered');
    sheet.appendRow([asText_(payload.id),new Date(),asText_(payload.data.name),asText_(payload.data.email),asText_(payload.data.message),'未対応','','','','','未送信','']);
    SpreadsheetApp.flush();row=sheet.getLastRow();console.log('GAS_SAVED');
    // Email outcomes must not invalidate or delete the saved application.
    try{sendAutoReply_(sheet,row,payload.data.name,payload.data.email);}catch(_){console.log('AUTO_REPLY_STATE_ERROR');}
    return gasReply_('OK');
  }catch(_){console.log('GAS_STORAGE_ERROR');return gasReply_('Error');}
  finally{if(acquired)lock.releaseLock();}
}
function autoReplyBody_(name){return name+'様\n\n'+
'この度は、Reの無料キャリア設計にお申し込みいただき、ありがとうございます。\n\n'+
'お申し込みを正常に受け付けました。\n\n'+
'今後の流れについては、担当者よりメールにてご連絡し、キャリア設計の日程をご案内いたします。\n\n'+
'今の仕事についての悩みや、これから挑戦してみたいことなど、まだ考えがまとまっていなくても大丈夫です。\n\n'+
'あなたが大切にしたいことや、これからの可能性を一緒に考えていけたらうれしいです。\n\n'+
'担当者からのご連絡まで、今しばらくお待ちください。\n\n'+
'---\n\n株式会社ソウルシンクス\nRe キャリア支援担当\n\n'+
'※このメールは、お申し込みを受け付けた際に自動送信しています。';}
function setReplyState_(sheet,row,state,date){sheet.getRange(row,11,1,2).setValues([[state,date||'']]);SpreadsheetApp.flush();}
function sendAutoReply_(sheet,row,name,email){
  var state=sheet.getRange(row,11).getDisplayValue();
  var retryable=['未送信','未送信（設定不備）','未送信（送信上限）','未送信（権限・制限確認）'];
  if(retryable.indexOf(state)<0){console.log('AUTO_REPLY_SKIPPED');return;}
  var replyTo=PropertiesService.getScriptProperties().getProperty('AUTO_REPLY_REPLY_TO');
  if(!emailAddress_(replyTo)||!emailAddress_(email)){setReplyState_(sheet,row,'未送信（設定不備）');console.log('AUTO_REPLY_CONFIG_ERROR');return;}
  var quota;
  try{quota=MailApp.getRemainingDailyQuota();}catch(_){setReplyState_(sheet,row,'未送信（権限・制限確認）');console.log('AUTO_REPLY_AUTH_OR_QUOTA_ERROR');return;}
  if(quota<1){setReplyState_(sheet,row,'未送信（送信上限）');console.log('AUTO_REPLY_QUOTA_EXCEEDED');return;}
  // Durable marker BEFORE the external side effect. Crashes/timeouts are not auto-retried.
  setReplyState_(sheet,row,'送信処理中');
  try{
    MailApp.sendEmail({to:email,replyTo:replyTo,name:'株式会社ソウルシンクス Re キャリア支援担当',subject:'【Re】無料キャリア設計のお申し込みありがとうございます',body:autoReplyBody_(name)});
  }catch(_){
    // MailApp exceptions do not prove that no email was accepted; require human verification.
    try{setReplyState_(sheet,row,'送信結果不明');}catch(__){console.log('AUTO_REPLY_STATE_ERROR');}
    console.log('AUTO_REPLY_SEND_RESULT_UNKNOWN');return;
  }
  // If this write fails, the row stays processing/unknown and is never blindly resent.
  try{setReplyState_(sheet,row,'送信済み',new Date());console.log('AUTO_REPLY_SENT');}
  catch(_){console.log('AUTO_REPLY_SENT_STATE_WRITE_ERROR');}
}
// Run in the GAS editor as the deployment owner. Authorizes MailApp without sending mail.
function authorizeAutoReply(){MailApp.getRemainingDailyQuota();console.log('AUTO_REPLY_AUTHORIZATION_OK');}
// Set AUTO_REPLY_RETRY_ID in Script Properties, then run this function in the editor.
// Only known-unsent states can be retried. Never retry unknown states without investigation.
function retryAutoReply(){
  var props=PropertiesService.getScriptProperties(),id=props.getProperty('AUTO_REPLY_RETRY_ID');
  props.deleteProperty('AUTO_REPLY_RETRY_ID');
  if(!id){console.log('AUTO_REPLY_RETRY_ID_MISSING');return;}
  var lock=LockService.getScriptLock(),acquired=false;
  try{
    acquired=lock.tryLock(20000);if(!acquired){console.log('GAS_LOCK_TIMEOUT');return;}
    var sheet=sheet_(),row=findReceiptRow_(sheet,id);if(!row){console.log('AUTO_REPLY_RECEIPT_NOT_FOUND');return;}
    var values=sheet.getRange(row,3,1,2).getDisplayValues()[0];sendAutoReply_(sheet,row,values[0],values[1]);
  }catch(_){console.log('AUTO_REPLY_RETRY_ERROR');}
  finally{if(acquired)lock.releaseLock();}
}
