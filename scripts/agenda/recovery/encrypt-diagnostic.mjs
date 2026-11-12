import {randomBytes,createCipheriv,publicEncrypt,constants} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function sealDiagnostic(input,publicKey){
  const key=randomBytes(32),iv=randomBytes(12);
  const cipher=createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from('LDR recovery catalog diagnostic v1'));
  const ciphertext=Buffer.concat([cipher.update(input),cipher.final()]);
  const wrapped=publicEncrypt({key:publicKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key);
  key.fill(0);
  return {version:1,algorithm:'RSA-OAEP-SHA256+AES-256-GCM',wrapped_key:wrapped.toString('base64'),
    iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  try{
    const input=readFileSync(0),publicKey=readFileSync(new URL('./diagnostic-public.pem',import.meta.url));
    const result=sealDiagnostic(input,publicKey);
    writeFileSync(process.argv[2],JSON.stringify(result)+'\n',{mode:0o600});input.fill(0);
  }catch{process.exitCode=1;}
}
