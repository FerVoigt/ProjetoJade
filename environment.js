/* Dynamic sky and pooled torch lighting; no extra shadow maps per torch. */
(function(root){'use strict';
root.JadeEnvironment=function({T,scene,sky,sun,ambient,player,glowTexture,legal}){
 let seconds=JadeDaylight.START,cycle=JadeDaylight.state(seconds),torches=[],lightTimer=1,hudTimer=1,lastNight=false;
 const lights=Array.from({length:6},()=>{const l=new T.PointLight('#ffae55',0,18,2);scene.add(l);return l;}),assignments=[];
 scene.add(sun.target);
 const colors={daySky:new T.Color('#4f8fba'),dayHorizon:new T.Color('#e4d9b1'),dayFog:new T.Color('#aec9c6'),nightSky:new T.Color('#081329'),nightHorizon:new T.Color('#354660'),nightFog:new T.Color('#26394e'),duskSky:new T.Color('#716781'),duskHorizon:new T.Color('#e6a27b'),daySun:new T.Color('#ffe9c5'),nightSun:new T.Color('#a8c7ff'),dayAmbient:new T.Color('#fff4d9'),nightAmbient:new T.Color('#9aafe1')};
 const starGeo=new T.BufferGeometry(),positions=[];let seed=81;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<400;i++){const a=rnd()*Math.PI*2,y=.12+rnd()*.85,r=Math.sqrt(1-y*y);positions.push(Math.cos(a)*r*280,y*280,Math.sin(a)*r*280);}starGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));const stars=new T.Points(starGeo,new T.PointsMaterial({color:'#dbe7ff',size:.65,transparent:true,opacity:0,depthWrite:false,fog:false}));scene.add(stars);
 const moon=new T.Mesh(new T.SphereGeometry(4,16,12),new T.MeshBasicMaterial({color:'#e2eaff',transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(moon);
 function addTorch(x,z){if(!legal(x,z)||torches.some(t=>Math.hypot(t.g.position.x-x,t.g.position.z-z)<3))return;const g=new T.Group();g.position.set(x,0,z);scene.add(g);
  const part=(geo,mat,y)=>{const m=new T.Mesh(geo,mat);m.position.y=y;m.receiveShadow=true;g.add(m);return m;};
  part(new T.CylinderGeometry(.35,.46,.28,8),new T.MeshStandardMaterial({color:'#787b70'}),.14);part(new T.CylinderGeometry(.10,.16,1.75,7),new T.MeshStandardMaterial({color:'#684e3e'}),1.1);part(new T.CylinderGeometry(.31,.17,.3,8),new T.MeshStandardMaterial({color:'#453b36',metalness:.6,roughness:.4}),2);
  const flame=part(new T.ConeGeometry(.21,.66,7),new T.MeshBasicMaterial({color:'#ffba54',transparent:true,opacity:0}),2.43);const core=part(new T.ConeGeometry(.12,.4,7),new T.MeshBasicMaterial({color:'#fff1af',transparent:true,opacity:0}),2.32);
  const halo=new T.Sprite(new T.SpriteMaterial({map:glowTexture,color:'#ffac49',transparent:true,blending:T.AdditiveBlending,depthWrite:false,opacity:0}));halo.position.y=2.42;halo.scale.set(2.1,2.8,1);g.add(halo);torches.push({g,flame,core,halo});
 }
 function rebuild(world){for(const t of torches){scene.remove(t.g);t.g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}torches=[];assignments.length=0;
  for(const z of [-14,0,14,26])for(const x of [-5,5])addTorch(x,z);
  for(const sign of [-1,1])for(const x of [34,43,52,68,84])addTorch(x*sign,2.1);
  for(const r of world.regions)for(const dz of [-17,13])for(const dx of [-3.6,3.6])addTorch(r.x+dx,r.z+dz);
  for(const b of world.bridges){const x=(b.x1+b.x2)/2,z=(b.z1+b.z2)/2;addTorch(x+(b.x1===b.x2?2:0),z+(b.z1===b.z2?2:0));}
  lightTimer=1;
 }
 function update(dt,active,notify){seconds=JadeDaylight.advance(seconds,dt,active);cycle=JadeDaylight.state(seconds);const n=cycle.night,dusk=4*n*(1-n);
  sky.material.uniforms.top.value.copy(colors.daySky).lerp(colors.nightSky,n).lerp(colors.duskSky,dusk*.6);sky.material.uniforms.bottom.value.copy(colors.dayHorizon).lerp(colors.nightHorizon,n).lerp(colors.duskHorizon,dusk*.8);
  scene.fog.color.copy(colors.dayFog).lerp(colors.nightFog,n);scene.background.copy(scene.fog.color);scene.fog.density=.008+n*.002;
  ambient.color.copy(colors.dayAmbient).lerp(colors.nightAmbient,n);ambient.intensity=1.7-1.12*n;ambient.groundColor.set('#658c83').lerp(colors.nightFog,n);
  sun.color.copy(colors.daySun).lerp(colors.nightSun,n);sun.intensity=2.1-1.65*n;sun.position.set(player.position.x-22,40,player.position.z+18);sun.target.position.copy(player.position);
  stars.position.copy(player.position);stars.material.opacity=n*.85;stars.visible=n>.01;moon.position.copy(player.position).add(new T.Vector3(-90,130,-155));moon.material.opacity=n;moon.visible=n>.01;
  const flickerTime=seconds*2;for(let i=0;i<torches.length;i++){const t=torches[i];t.g.visible=t.g.position.distanceTo(player.position)<80;const f=1+Math.sin(flickerTime*7+i*2)*.1+Math.sin(flickerTime*13+i)*.06;t.flame.scale.set(1/f,f,1/f);t.core.scale.y=f;t.flame.material.opacity=n;t.core.material.opacity=n;t.halo.material.opacity=n*.6*f;t.flame.visible=t.core.visible=t.halo.visible=n>.01;}
  lightTimer+=dt;if(lightTimer>=.25){lightTimer=0;const nearest=torches.map((t,i)=>({i,d:t.g.position.distanceTo(player.position)})).filter(t=>t.d<32).sort((a,b)=>a.d-b.d).slice(0,6);assignments.splice(0,assignments.length,...nearest.map(t=>t.i));}
  lights.forEach((l,i)=>{const t=torches[assignments[i]];if(t){l.position.copy(t.g.position);l.position.y=2.5;l.intensity=n*38*(1+Math.sin(flickerTime*7+assignments[i]*2)*.08);}else l.intensity=0;});
  const night=n>=.5;if(active&&night!==lastNight)notify(night?'A noite chegou. Inimigos percebem você mais longe e atacam mais rápido.':'O amanhecer chegou. A agressividade dos inimigos começa a diminuir.');lastNight=night;
  hudTimer+=dt;if(hudTimer>=.2||dt===0){hudTimer=0;const panel=document.getElementById('dayNightHUD');panel.dataset.phase=night?'night':'day';document.getElementById('worldClock').textContent=(night?'☾ ':'☀ ')+cycle.phase+' · '+cycle.clock;document.getElementById('nightHint').textContent=night?'Vigilância +'+Math.round((cycle.aggro-1)*100)+'% · velocidade +'+Math.round((cycle.speed-1)*100)+'%':'Ciclo de 12 min · o tempo pausa nos menus';panel.title='À noite: alcance de percepção +50%, movimento +20% e recarga dos ataques 30% mais rápida. As tochas iluminam o caminho.';}
 }
 return {load(st,world){seconds=JadeDaylight.clean(st.dayTime);lastNight=JadeDaylight.state(seconds).night>=.5;rebuild(world);update(0,false,()=>{});},update,get seconds(){return seconds;},get cycle(){return cycle;},inspect(){return {...cycle,seconds,torchCount:torches.length,litTorches:cycle.night>.01?torches.length:0,activeLights:lights.filter(l=>l.intensity>0).length,torches:torches.map(t=>({x:t.g.position.x,z:t.g.position.z})),ambient:ambient.intensity,sun:sun.intensity};}};
};
})(window);
