const assert=require('node:assert/strict'),D=require('./daylight.js'),Storage=require('./storage.js');
assert.equal(D.clean(undefined),240);assert.equal(D.clean(-1),240);assert.equal(D.clean(Infinity),240);assert.equal(D.clean(730),10);
assert.equal(D.state(360).phase,'Dia');assert.equal(D.state(660).phase,'Noite');assert.equal(D.state(180).phase,'Amanhecer');assert.equal(D.state(540).phase,'Anoitecer');assert.equal(D.state(660).clock,'22:00');
assert.equal(D.advance(719,2,true),1);assert.equal(D.advance(360,10,false),360);assert.equal(D.advance(360,-1,true),360);
assert.deepEqual([D.state(360).aggro,D.state(360).speed,D.state(360).attackRate],[1,1,1]);assert.deepEqual([D.state(660).aggro,D.state(660).speed,D.state(660).attackRate],[1.5,1.2,1.3]);
for(let t=0;t<720;t+=.5){const a=D.state(t),b=D.state(t+.5);assert(a.night>=0&&a.night<=1);assert(Math.abs(a.night-b.night)<.02);}
const slot=Storage.cleanSlot({name:'Teste',classId:'summoner',state:{dayTime:660}});assert.equal(slot.state.dayTime,660);assert.equal(Storage.cleanSlot({name:'Antigo',classId:'mage'}).state.dayTime,240);assert.equal(Storage.parse(JSON.stringify({version:3,slots:[slot,null,null]})).slots[0].state.dayTime,660);
console.log('PASS daylight: phases, continuous transitions, midnight wrap, paused time, aggression factors, legacy default and saved clock.');
