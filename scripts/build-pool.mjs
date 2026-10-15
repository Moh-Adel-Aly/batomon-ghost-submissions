import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
const incoming=path.join(root,'incoming');
const creatureIds=new Set(catalog.creatures),trainerIds=new Set(catalog.trainers),chewIds=new Set(catalog.chews);
const levelCap=round=>round<4?1:round<7?2:3;
const accepted=[];
for(const file of fs.readdirSync(incoming).filter(f=>f.endsWith('.json')).sort()){
  try{
    const g=JSON.parse(fs.readFileSync(path.join(incoming,file),'utf8'));
    if(!g||!Number.isInteger(g.round)||g.round<1||g.round>=catalog.bossRound||!trainerIds.has(g.trainer)||!Array.isArray(g.chews)||g.chews.length>12||new Set(g.chews).size!==g.chews.length||g.chews.some(x=>!chewIds.has(x))||!Array.isArray(g.board)||g.board.length!==6||!g.board.some(Boolean))continue;
    const board=g.board.map(mon=>{
      if(mon===null)return null;
      if(!mon||!creatureIds.has(mon.id)||!Number.isInteger(mon.level)||mon.level<1||mon.level>levelCap(g.round)||!Number.isInteger(mon.bonus)||Math.abs(mon.bonus)>1000||typeof mon.shiny!=='boolean')throw new Error('invalid slot');
      return {id:mon.id,level:mon.level,bonus:mon.bonus,shiny:mon.shiny};
    });
    const normalized={round:g.round,trainer:g.trainer,chews:g.chews,board};
    const hash=createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
    if(path.basename(file)!==`${hash}.json`||g.id!==`player-${hash.slice(0,20)}`)continue;
    accepted.push({id:g.id,name:'A wandering trainer',...normalized,_hash:hash});
  }catch{}
}
const counts=new Map(),pool=[];
for(const ghost of accepted){
  const count=counts.get(ghost.round)||0;
  if(count>=100)continue;
  counts.set(ghost.round,count+1);
  const {_hash,...entry}=ghost;
  pool.push(entry);
}
fs.writeFileSync(path.join(root,'pool.json'),`${JSON.stringify(pool,null,2)}\n`);
console.log(`Built pool with ${pool.length} validated submitted teams from ${accepted.length} valid files.`);
