/* A twelve-minute local day, advancing only during active play. */
(function(root){'use strict';
const DURATION=720,START=240;
const clean=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v%DURATION:START;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function state(seconds){const hour=clean(seconds)/DURATION*24,night=hour<5||hour>=19?1:hour<7?1-smooth((hour-5)/2):hour<17?0:smooth((hour-17)/2),phase=hour>=5&&hour<7?'Amanhecer':hour>=7&&hour<17?'Dia':hour>=17&&hour<19?'Anoitecer':'Noite';return {hour,night,phase,clock:String(Math.floor(hour)).padStart(2,'0')+':'+String(Math.floor(hour%1*60)).padStart(2,'0'),aggro:1+.5*night,speed:1+.2*night,attackRate:1+.3*night};}
function advance(seconds,dt,active){return clean(clean(seconds)+(active&&Number.isFinite(dt)?Math.max(0,dt):0));}
const api={DURATION,START,clean,state,advance};root.JadeDaylight=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
