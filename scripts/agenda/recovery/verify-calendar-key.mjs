import { createDecipheriv } from 'node:crypto';
try {
  let input='';
  for await (const chunk of process.stdin) { input+=chunk; if(input.length>131072)throw Error(); }
  const data=JSON.parse(input), key=Buffer.from(data.key,'base64'), bytes=Buffer.from(data.ciphertext,'base64');
  if(key.length!==32 || bytes.length<29)throw Error();
  const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(0,12));
  decipher.setAuthTag(bytes.subarray(12,28));
  const token=Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]);
  if(!token.length)throw Error();
  token.fill(0); key.fill(0); bytes.fill(0);
  console.log('PASS recovered Calendar token decryption');
} catch { console.error('BLOCKED recovered_calendar_key_invalid');process.exitCode=1; }
