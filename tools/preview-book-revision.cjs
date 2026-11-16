// Reproduce a protected local preview from a reviewed manifest. Never activate or modify the input.
const fs=require('node:fs'),path=require('node:path');
const {applyPreview}=require('./book-boilerplate-preview.cjs');
const [inputFile,planFile,outputFile]=process.argv.slice(2);
if(!inputFile||!planFile||!outputFile)throw new Error('Expected decoded export, revision plan and output path outside the repository');
const root=fs.realpathSync(path.resolve(__dirname,'..'));
const input=fs.realpathSync(inputFile),output=path.resolve(outputFile);
// Resolve the existing parent too, so symlinks cannot put protected prose inside the repository.
const parent=fs.realpathSync(path.dirname(output));
const target=path.join(parent,path.basename(output));
if(target===input||target===root||target.startsWith(root+path.sep)||fs.existsSync(target))throw new Error('Preview must be a new file outside the repository and must not replace its source');
const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));
const rows=JSON.parse(fs.readFileSync(input,'utf8'));
const source=rows.find(row=>row.product_key===plan.productKey&&row.locale===plan.locale&&row.version===plan.baseVersion);
if(!source)throw new Error('Source edition not present in export');
const before=fs.readFileSync(input);
const preview=applyPreview(source,plan);
fs.writeFileSync(target,JSON.stringify(preview,null,2)+'\n',{flag:'wx',mode:0o600});
if(!before.equals(fs.readFileSync(input)))throw new Error('Input changed during preview; review required');
console.log(JSON.stringify({productKey:plan.productKey,baseVersion:plan.baseVersion,removedCopies:plan.removals.length,published:false}));
