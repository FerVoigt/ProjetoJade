/* Commerce views use the game's paused dialog and an atomic storage adapter. */
(function(root){'use strict';
root.JadeCommerce=function(api){
 const E=JadeEconomy,S=JadeSystems,el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 let region=0,tab='buy',notice='';
 const button=(parent,text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;parent.append(b);return b;};
 function field(parent,label,type,value,min,max){const wrap=el('label',label),n=el('input');n.type=type;n.value=value;n.min=min;n.max=max;n.step=1;wrap.append(n);parent.append(wrap);return n;}
 function act(action){try{notice=api.commit(action);render();}catch(e){notice=e.message;const n=document.getElementById('marketNotice');n.textContent=notice;n.classList.add('error');}}
 function render(){
  const data=api.data(),index=api.index(),slot=data.slots[index],bag=slot.state.inventory,e=E.current(data.economy);
  api.dialog('Casa das caravanas',E.REGIONS[region].name+' · COMÉRCIO', 'Mercados e trocas locais entre os seus três personagens.');
  document.querySelector('.dialogCard').classList.add('commerce');const body=document.getElementById('dialogActions');
  const stats=el('div',undefined,'marketStats');stats.append(el('strong',bag.coins.toLocaleString('pt-BR')+' moedas'),el('span','Reputação '+e.reputation+'/100 · desconto '+Math.min(e.reputation,100)/10+'%'),el('span',bag.items.length+'/60 espaços'));body.append(stats);
  const status=el('p',notice||'Estoque e encomendas compartilhados pelas três vagas. Renovação a cada 30 minutos.','marketNotice');status.id='marketNotice';status.setAttribute('role','status');body.append(status);
  const nav=el('nav',undefined,'marketTabs');nav.setAttribute('aria-label','Seções do comércio');for(const [id,label] of [['buy','Comprar'],['sell','Vender'],['orders','Encomendas'],['routes','Rotas comerciais'],['trade','Trocar personagens'],['history','Extrato']]){const b=button(nav,label,()=>{tab=id;notice='';render();});b.setAttribute('aria-pressed',String(tab===id));}body.append(nav);
  const content=el('div',undefined,'marketContent');body.append(content);
  if(tab==='buy'||tab==='sell'){
   content.append(el('p',tab==='buy'?'Preços finais por unidade. Estoque limitado; vendas não repõem o estoque.':'Venda equipamentos, consumíveis e materiais. Uma unidade de cada item equipado fica protegida.'));
   const rows=tab==='buy'?E.offers(region,slot.classId,e):bag.items.filter(r=>E.available(bag,r.id)>0).map(r=>({it:S.byId(r.id),stock:E.available(bag,r.id),sell:E.price(r.id,region,'sell',e.reputation)}));
   if(!rows.length)content.append(el('p','Nenhum item disponível para vender.'));
   const grid=el('div',undefined,'marketGrid');content.append(grid);
   for(const row of rows){const {it,stock}=row,unit=tab==='buy'?row.buy:row.sell,card=el('article',undefined,'marketItem');card.dataset.item=it.id;card.append(el('h3',it.icon+' '+it.name),el('small',S.RARITIES[it.rarity].name+(it.slot?' · nível '+it.required:'')),el('p',(tab==='buy'?'Estoque: ':'Disponíveis: ')+stock+' · '+unit+' moedas/un.'));if(it.description)card.append(el('p',it.description));const qty=field(card,'Quantidade de '+it.name,'number',1,1,Math.max(1,stock)),buying=tab==='buy',b=button(card,(buying?'Comprar':'Vender')+' · '+unit+' moedas',()=>act({type:tab,region,id:it.id,qty:Number(qty.value)}));
    function update(){const q=Number(qty.value),valid=Number.isInteger(q)&&q>0&&q<=stock;b.textContent=(buying?'Comprar':'Vender')+' · '+(valid?q*unit:0)+' moedas';b.disabled=!valid||(buying&&q*unit>bag.coins);}
    qty.oninput=update;update();grid.append(card);
   }
  }else if(tab==='orders'){
   const o=E.order(region),card=el('article',undefined,'marketItem');card.append(el('h3','Suprimentos para a caravana'),el('p','Entregue '+o.qty+' essências das trevas para manter as rotas protegidas.'),el('p','Você possui '+E.available(bag,o.id)+' · Recompensa: '+o.reward+' moedas + 5 reputação.'),el('p','A reputação é compartilhada e reduz preços de compra em até 10%.'));content.append(card);const done=e.orders.includes(region),b=button(card,done?'Encomenda concluída':'Entregar encomenda',()=>act({type:'order',region}));b.disabled=done||E.available(bag,o.id)<o.qty;const mins=Math.max(1,Math.ceil(((e.period+1)*E.PERIOD-Date.now())/60000));content.append(el('p','Próxima renovação em aproximadamente '+mins+' min. Uma entrega por mercado, compartilhada entre personagens.'));
  }else if(tab==='routes'){
   content.append(el('h3','Compre na origem, venda no destino'),el('p','Compare os preços, reserve espaço e leve mercadorias aos acampamentos. As rotas rendem moedas; baús e criaturas ajudam a financiar a primeira viagem.'));
   const table=el('table'),head=el('tr');for(const title of ['Mercadoria','Comprar em','Vender em','Lucro / un.'])head.append(el('th',title));table.append(head);
   for(const [key,from,to] of [['tea',0,3],['silk',2,4],['ore',4,0]]){const id=S.item(key).id,buy=E.price(id,from,'buy',e.reputation),sell=E.price(id,to,'sell'),tr=el('tr');for(const text of [S.ITEMS[key].name,E.REGIONS[from].name+' · '+buy,E.REGIONS[to].name+' · '+sell,'+'+(sell-buy)])tr.append(el('td',text));table.append(tr);}content.append(table,el('p','M abre o mapa fora da conversa. Descubra os acampamentos para liberar a viagem rápida. Cada mercado mantém o seu estoque mesmo ao trocar de personagem.'));
  }else if(tab==='history'){
   content.append(el('p','Últimas 30 operações da coleção de personagens.'));for(const h of [...e.history].reverse()){const row=el('article');row.append(el('small',new Date(h.at).toLocaleString('pt-BR')),el('p',h.text));content.append(row);}if(!e.history.length)content.append(el('p','Suas negociações aparecerão aqui.'));
  }else if(tab==='trade'){
   content.append(el('p','Troca direta entre as vagas deste navegador. Pode enviar um presente ou combinar itens e moedas dos dois lados. Não há taxa.'));
   const targets=data.slots.map((s,i)=>s&&i!==index?{s,i}:null).filter(Boolean);if(!targets.length){content.append(el('p','Crie um segundo personagem em uma vaga vazia para liberar as trocas.'));return;}
   const label=el('label','Negociar com'),target=el('select');target.id='tradeTarget';for(const {s,i} of targets){const o=el('option',s.name+' · nível '+s.state.level);o.value=i;target.append(o);}label.append(target);content.append(label);const form=el('div',undefined,'tradeColumns');content.append(form);const controls=el('div');content.append(controls);
   function build(){target.disabled=false;form.replaceChildren();controls.replaceChildren();const other=data.slots[Number(target.value)],sides=[];
    for(const [owner,caption] of [[slot,'Você entrega'],[other,'Você recebe']]){const b=owner.state.inventory,box=el('article',undefined,'marketItem');box.append(el('h3',caption+' · '+owner.name),el('p',b.coins+' moedas na bolsa'));const l=el('label','Item'),select=el('select');select.setAttribute('aria-label',caption+' item');const none=el('option','Sem item');none.value='';select.append(none);for(const row of b.items.filter(r=>E.available(b,r.id)>0)){const opt=el('option',S.byId(row.id).name+' × '+E.available(b,row.id));opt.value=row.id;select.append(opt);}l.append(select);box.append(l);const qty=field(box,caption+' quantidade','number',1,1,999),coins=field(box,caption+' moedas','number',0,0,b.coins);form.append(box);sides.push(()=>({id:select.value,qty:Number(qty.value),coins:Number(coins.value)}));}
    button(controls,'Revisar troca',()=>{const action={type:'trade',target:Number(target.value),give:sides[0](),take:sides[1]()};try{const preview=E.run(api.data(),index,action);controls.replaceChildren();controls.append(el('p',preview.message),el('p','Confira os dois lados. A troca só será concluída ao confirmar.'));button(controls,'Confirmar troca',()=>act(action));button(controls,'Editar oferta',build);for(const n of form.querySelectorAll('input,select'))n.disabled=true;target.disabled=true;}catch(err){status.textContent=err.message;status.classList.add('error');}});
   }target.onchange=build;build();
  }
 }
 return {open(r){region=r;tab='buy';notice='';render();}};
};
})(window);
