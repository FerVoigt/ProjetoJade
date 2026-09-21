/* Local, shared economy. Pure transactions: validate both sides before saving. */
(function(root){'use strict';
const S=typeof module!=='undefined'?require('./systems.js'):root.JadeSystems;
const REGIONS=[{id:'tao',name:'Santuário',tier:1},{id:'ren',name:'Esmeralda',tier:3},{id:'noor',name:'Âmbar',tier:5},{id:'hana',name:'Geada',tier:7},{id:'sora',name:'Eclipse',tier:9}];
const PERIOD=30*60*1000,MAX=9999999,clone=v=>JSON.parse(JSON.stringify(v));
const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
function clean(v){const used={};for(const [k,n] of Object.entries(v?.used||{}).slice(0,300))if(/^[0-4]:[a-z]+:\d+:(common|uncommon|rare|epic)$/.test(k)&&integer(n,0,999))used[k]=n;return {period:integer(v?.period,0,1e10)?v.period:0,used,orders:Array.isArray(v?.orders)?[...new Set(v.orders.filter(n=>integer(n,0,4)))]:[],reputation:integer(v?.reputation,0,100)?v.reputation:0,history:Array.isArray(v?.history)?v.history.filter(h=>h&&typeof h.text==='string'&&Number.isFinite(h.at)).slice(-30).map(h=>({text:h.text.slice(0,240),at:h.at})):[]};}
function current(v,now=Date.now()){const e=clean(v),period=Math.floor(now/PERIOD);if(period>e.period){e.period=period;e.used={};e.orders=[];}return e;}
function available(b,id){return Math.max(0,(b.items.find(i=>i.id===id)?.qty||0)-(Object.values(b.equipped).includes(id)?1:0));}
function price(id,r,side,rep=0){const it=S.byId(id);if(!it||!REGIONS[r])throw Error('Mercadoria inválida.');const goods={tea:[0,3],silk:[2,4],ore:[4,0]};let buy,sell;if(goods[it.key]){const [origin,demand]=goods[it.key];buy=r===origin?18:r===demand?48:36;sell=r===origin?9:r===demand?30:16;}else{const value=it.slot?Math.round((30+it.tier*32)*S.RARITIES[it.rarity].factor):it.key==='shard'?20:25;buy=Math.ceil(value*(1+r*.04));sell=Math.floor(value*.4);}return side==='buy'?Math.ceil(buy*(1-Math.min(rep,100)/1000)):sell;}
function offers(r,cls,e){const tier=REGIONS[r].tier;return ['health','mana','shard','tea','silk','ore',S.WEAPONS[cls],'robe','amulet'].map(key=>{const it=S.item(key,S.ITEMS[key].slot?tier:0,S.ITEMS[key].slot?'uncommon':'common'),limit=it.slot?2:['tea','silk','ore'].includes(key)?8:20;return {it,stock:Math.max(0,limit-(e.used[r+':'+it.id]||0)),buy:price(it.id,r,'buy',e.reputation),sell:price(it.id,r,'sell',e.reputation)};});}
function order(r){return {id:'shard:0:common',qty:5+r*2,reward:90+r*50,rep:5};}
function remove(b,id,qty){if(!S.byId(id)||!integer(qty,1,999)||available(b,id)<qty)throw Error('Quantidade indisponível. A unidade equipada fica protegida.');const row=b.items.find(i=>i.id===id);row.qty-=qty;b.items=b.items.filter(i=>i.qty>0);}
function add(b,id,qty){if(!S.byId(id)||!integer(qty,1,999))throw Error('Quantidade inválida.');const row=b.items.find(i=>i.id===id);if((!row&&b.items.length>=60)||(row?.qty||0)+qty>999)throw Error('Sem espaço na mochila para toda a troca.');if(row)row.qty+=qty;else b.items.push({id,qty});}
function money(b,delta){const next=b.coins+delta;if(!integer(next,0,MAX))throw Error(delta<0?'Moedas insuficientes.':'Limite de moedas atingido.');b.coins=next;}
function run(data,index,a,now=Date.now()){
 const out=clone(data),slot=out.slots[index];if(!slot)throw Error('Personagem inválido.');const b=slot.state.inventory,e=current(out.economy,now);out.economy=e;let message='';
 if(a.type==='trade'){
  if(!integer(a.target,0,2)||a.target===index||!out.slots[a.target])throw Error('Escolha outro personagem criado.');const other=out.slots[a.target],bb=other.state.inventory;
  const give=a.give||{},take=a.take||{};for(const side of [give,take]){if(!integer(side.coins,0,MAX))throw Error('Informe moedas inteiras e positivas.');if(side.id&&!integer(side.qty,1,999))throw Error('Quantidade inválida.');}
  if(!give.id&&!take.id&&!give.coins&&!take.coins)throw Error('Adicione itens ou moedas à troca.');
  // Each participant must possess their offer before receiving anything.
  if(b.coins<give.coins||bb.coins<take.coins)throw Error('Moedas insuficientes em um dos personagens.');
  if(give.id)remove(b,give.id,give.qty);if(take.id)remove(bb,take.id,take.qty);
  if(give.id)add(bb,give.id,give.qty);if(take.id)add(b,take.id,take.qty);
  money(b,take.coins-give.coins);money(bb,give.coins-take.coins);other.updatedAt=now;
  const describe=s=>(s.id?s.qty+' × '+S.byId(s.id).name+' + ':'')+s.coins+' moedas';
  message=slot.name+' → '+other.name+': '+describe(give)+' | Volta: '+describe(take);
 }else{
  const r=a.region;if(!integer(r,0,4))throw Error('Mercado inválido.');
  if(a.type==='order'){const o=order(r);if(e.orders.includes(r))throw Error('Encomenda já entregue nesta renovação.');remove(b,o.id,o.qty);money(b,o.reward);e.orders.push(r);e.reputation=Math.min(100,e.reputation+o.rep);message='Encomenda em '+REGIONS[r].name+': +'+o.reward+' moedas e +5 reputação.';}
  else if(a.type==='buy'||a.type==='sell'){
   const qty=a.qty;if(!integer(qty,1,999))throw Error('Use uma quantidade inteira de 1 a 999.');const it=S.byId(a.id);if(!it)throw Error('Item inválido.');const unit=price(a.id,r,a.type,e.reputation),total=unit*qty;
   if(a.type==='buy'){const offer=offers(r,slot.classId,e).find(o=>o.it.id===a.id);if(!offer||offer.stock<qty)throw Error('Estoque insuficiente.');money(b,-total);add(b,a.id,qty);const k=r+':'+a.id;e.used[k]=(e.used[k]||0)+qty;}
   else{remove(b,a.id,qty);money(b,total);}
   message=(a.type==='buy'?'Compra':'Venda')+' em '+REGIONS[r].name+': '+qty+' × '+it.name+' · '+total+' moedas.';
  }else throw Error('Operação desconhecida.');
 }
 slot.updatedAt=now;e.history.push({at:now,text:message});e.history=e.history.slice(-30);return {data:out,message};
}
const api={REGIONS,PERIOD,clean,current,available,price,offers,order,run};root.JadeEconomy=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
