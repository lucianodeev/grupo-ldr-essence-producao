const ACCEPTED=new Set(["image/jpeg","image/png","image/webp"]);

export async function optimizeAcademicImage(file:File,maxDimension:number){
  const rawType=file.type.toLowerCase();
  const sourceExt=file.name.split(".").pop()?.toLowerCase();
  const type=rawType==="image/jpg"||rawType==="image/pjpeg"?"image/jpeg":rawType||({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",heic:"image/heic",heif:"image/heif"} as Record<string,string>)[sourceExt??""]||"";
  const heif=type==="image/heic"||type==="image/heif";
  if(!ACCEPTED.has(type)&&!heif)throw new Error("JPG, PNG ou WEBP.");
  if(file.size>12*1024*1024)throw new Error("A imagem original deve ter no máximo 12 MB.");
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error(heif?"Este navegador não consegue abrir HEIC. Selecione a foto em JPEG, PNG ou WEBP.":"Não foi possível processar a imagem."));el.src=url});
    const sourceW=img.naturalWidth||img.width,sourceH=img.naturalHeight||img.height;
    if(!sourceW||!sourceH)throw new Error("Imagem inválida.");
    const scale=Math.min(1,maxDimension/Math.max(sourceW,sourceH));
    const width=Math.max(1,Math.round(sourceW*scale)),height=Math.max(1,Math.round(sourceH*scale));
    const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d",{alpha:true});if(!ctx)throw new Error("Não foi possível otimizar a imagem.");
    ctx.drawImage(img,0,0,width,height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",0.86));
    if(!blob)throw new Error("Não foi possível comprimir a imagem.");
    if(blob.size>5*1024*1024)throw new Error("A imagem otimizada ainda excede 5 MB.");
    const actualType=blob.type.toLowerCase();
    if(!ACCEPTED.has(actualType))throw new Error("O navegador não conseguiu converter a imagem.");
    const ext=actualType==="image/jpeg"?"jpg":actualType==="image/png"?"png":"webp";
    const base=file.name.replace(/\.[^.]+$/i,"")||"academic-image";
    return new File([blob],`${base}.${ext}`,{type:actualType,lastModified:Date.now()});
  }finally{URL.revokeObjectURL(url)}
}
