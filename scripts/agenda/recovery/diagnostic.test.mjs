import {test} from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,privateDecrypt,createDecipheriv,constants} from 'node:crypto';
import {sealDiagnostic} from './encrypt-diagnostic.mjs';
test('diagnostic envelope decrypts exactly and reveals no synthetic plaintext',()=>{
 const keys=generateKeyPairSync('rsa',{modulusLength:2048});
 const input=Buffer.from('synthetic private policy text only');
 const encrypted=sealDiagnostic(input,keys.publicKey);
 assert(!JSON.stringify(encrypted).includes('synthetic'));
 const key=privateDecrypt({key:keys.privateKey,padding:constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(encrypted.wrapped_key,'base64'));
 const open=()=>{const d=createDecipheriv('aes-256-gcm',key,Buffer.from(encrypted.iv,'base64'));d.setAAD(Buffer.from('LDR recovery catalog diagnostic v1'));d.setAuthTag(Buffer.from(encrypted.tag,'base64'));return Buffer.concat([d.update(Buffer.from(encrypted.ciphertext,'base64')),d.final()]);};
 assert.deepEqual(open(),input);
 encrypted.ciphertext=Buffer.alloc(Buffer.from(encrypted.ciphertext,'base64').length).toString('base64');
 assert.throws(open);
});
