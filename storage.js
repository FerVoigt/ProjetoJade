/* Three local character slots. Versioned, validated, with a recovery copy. */
(function(root){'use strict';
const KEY='valeDeJade.characters.v3',BACKUP=KEY+'.backup',LEGACY='valeDeJade.profile.v2';
const classes=['sword','mage','guardian'];
const number=(v,min,max,fallback)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
function cleanSlot(v){
 if(!v||typeof v.name!=='string'||!classes.includes(v.classId))return null;
 const name=v.name.trim().replace(/\s+/g,' ').slice(0,20);if(name.length<2)return null;
 const s=v.state&&typeof v.state==='object'?v.state:{};
 const level=Math.floor(number(s.level,1,100,1));
 const enemies=Array.isArray(s.enemies)?s.enemies.filter(e=>e&&Number.isInteger(e.id)&&e.id>=0&&e.id<=5).map(e=>({id:e.id,alive:e.alive!==false,hp:number(e.hp,0,e.id===5?280:64,e.id===5?280:64),x:number(e.x,-35,35,0),z:number(e.z,-35,35,0)})):null;
 return {id:typeof v.id==='string'?v.id:'character-'+Date.now(),name,classId:v.classId,createdAt:number(v.createdAt,0,1e15,Date.now()),updatedAt:number(v.updatedAt,0,1e15,Date.now()),state:{level,xp:Math.floor(number(s.xp,0,100+(level-1)*50-1,0)),hp:number(s.hp,1,100,100),mp:number(s.mp,0,100,100),position:{x:number(s.position?.x,-35,35,0),z:number(s.position?.z,-35,35,8)},rotation:number(s.rotation,-1000,1000,Math.PI),cooldowns:[0,1,2].map(i=>number(s.cooldowns?.[i],0,15,0)),shieldTime:number(s.shieldTime,0,5,0),enemies,camDistance:number(s.camDistance,4,44,30),camYaw:number(s.camYaw,-1e8,1e8,.48),camPitch:number(s.camPitch,.06,1.25,.6)}};
}
function parse(raw){const v=JSON.parse(raw);if(!v||v.version!==3||!Array.isArray(v.slots)||v.slots.length!==3)throw Error('Invalid character collection');const slots=v.slots.map(x=>x===null?null:cleanSlot(x));if(v.slots.some((s,i)=>s!==null&&!slots[i]))throw Error('Invalid character');return {version:3,slots};}
class CharacterStore{
 constructor(storage){this.storage=storage;this.data={version:3,slots:[null,null,null]};this.warning='';this.blocked=false;this.load();}
 load(){let raw;try{raw=this.storage.getItem(KEY);}catch(e){this.warning='O navegador bloqueou o armazenamento. Use Baixar backup antes de sair.';return;}
 if(raw){try{this.data=parse(raw);return;}catch(e){try{const backup=this.storage.getItem(BACKUP);if(backup){this.data=parse(backup);this.storage.setItem(KEY+'.damaged',raw);this.warning='Personagens recuperados da cópia de segurança local.';return;}}catch(e){}this.blocked=true;this.warning='Não foi possível ler os personagens salvos. Os dados foram preservados; novos salvamentos estão bloqueados.';return;}}
 try{const old=JSON.parse(this.storage.getItem(LEGACY)||'null');if(old){const migrated=cleanSlot(old);if(migrated){this.data.slots[0]=migrated;this.warning='Seu personagem da versão anterior foi trazido para a primeira vaga.';this.persist();}}}catch(e){}
 }
 persist(){if(this.blocked)return false;try{const raw=JSON.stringify(this.data);const previous=this.storage.getItem(KEY);if(previous){try{parse(previous);this.storage.setItem(BACKUP,previous);}catch(e){}}this.storage.setItem(KEY,raw);return true;}catch(e){this.warning='Não foi possível salvar no navegador. Use Baixar backup antes de sair.';return false;}}
 set(index,slot){if(!Number.isInteger(index)||index<0||index>2)throw Error('Invalid slot');const clean=cleanSlot(slot);if(!clean)throw Error('Invalid character');this.data.slots[index]=clean;return this.persist();}
 remove(index){if(!Number.isInteger(index)||index<0||index>2)throw Error('Invalid slot');this.data.slots[index]=null;return this.persist();}
 export(){return JSON.stringify(this.data,null,2);}
}
root.JadeStorage={CharacterStore,cleanSlot,parse,KEY,BACKUP};if(typeof module!=='undefined')module.exports=root.JadeStorage;
})(typeof window!=='undefined'?window:globalThis);
