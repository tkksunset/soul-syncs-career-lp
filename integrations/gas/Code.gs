// Set WEBHOOK_SECRET and SPREADSHEET_ID in Script Properties, never in source.
function doPost(e) {
  function reply(text) { return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT); }
  var props=PropertiesService.getScriptProperties();
  var secret=props.getProperty('WEBHOOK_SECRET');
  if(!secret||!e||!e.parameter||e.parameter.key!==secret) { console.log('GAS_AUTH_ERROR');return reply('Unauthorized'); }
  var payload;
  try {payload=JSON.parse(e.postData.contents);}catch(_){console.log('GAS_INVALID_DATA');return reply('Invalid data');}
  if(!payload||typeof payload.id!=='string'||!payload.id.trim()||!payload.data||typeof payload.data.name!=='string'||!payload.data.name.trim()||typeof payload.data.email!=='string'||!/^\S+@\S+\.\S+$/.test(payload.data.email)|| (payload.data.message!=null&&typeof payload.data.message!=='string')) {console.log('GAS_INVALID_DATA');return reply('Invalid data');}
  var lock=LockService.getScriptLock();
  var acquired=false;
  try {
    acquired=lock.tryLock(20000);
    if(!acquired){console.log('GAS_LOCK_TIMEOUT');return reply('Error');}
    var spreadsheetId=props.getProperty('SPREADSHEET_ID');
    var ss=spreadsheetId?SpreadsheetApp.openById(spreadsheetId):SpreadsheetApp.getActiveSpreadsheet();
    if(!ss)throw new Error('NO_SPREADSHEET');
    var sheet=ss.getSheetByName('キャリア設計申込者管理');
    if(!sheet)throw new Error('NO_SHEET');
    var lastRow=sheet.getLastRow();
    if(lastRow>=2&&sheet.getRange(2,1,lastRow-1,1).getDisplayValues().some(function(row){return row[0]===payload.id;}))return reply('Already registered');
    // Prefix formula-like user values with an apostrophe to store them as text.
    function asText(value){value=String(value||'');return /^[\s]*[=+@-]/.test(value)?"'"+value:value;}
    sheet.appendRow([asText(payload.id),new Date(),asText(payload.data.name),asText(payload.data.email),asText(payload.data.message),'未対応','','','','']);
    SpreadsheetApp.flush();
    console.log('GAS_SAVED');return reply('OK');
  }catch(_){console.log('GAS_STORAGE_ERROR');return reply('Error');}
  finally{if(acquired)lock.releaseLock();}
}
