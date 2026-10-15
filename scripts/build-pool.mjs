import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {normalize} from './ghost-normalize.mjs';

const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
const incoming=path.join(root,'incoming');
const accepted=[];
for(const file of fs.readdirSync(incoming).filter(f=>f.endsWith('.json')).sort()){
  try{
    const g=JSON.parse(fs.readFileSync(path.join(incoming,file),'utf8'));
    const normalized=normalize(g,catalog);
    const hash=createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
    if(path.basename(file)!==`${hash}.json`||g.id!==`player-${hash.slice(0,20)}`)continue;
  accepted.push({id:g.id,name:normalized.playerName,...normalized,_hash:hash});
  }catch{}
}

const grouped=new Map();
for(const entry of accepted){
  const player=grouped.get(entry.playerId)||{};
  for(const round of [3,6,9])if(entry.snapshots[round])player[round]=entry.snapshots[round];
  grouped.set(entry.playerId,player);
}
for(const entry of accepted)entry.snapshots={...(grouped.get(entry.playerId)||{})};

const counts=new Map(),pool=[];
for(const ghost of accepted){
  const count=counts.get(ghost.round)||0;
  if(count>=100)continue;
  counts.set(ghost.round,count+1);
  const {_hash,playerId,...entry}=ghost;
  pool.push({...entry,playerKey:playerId});
}
const rivalKeys=new Set();
for(const entry of accepted){
  const snapshots=grouped.get(entry.playerId)||{};
  if(rivalKeys.has(entry.playerId)||![3,6,9].every(round=>snapshots[round]))continue;
  rivalKeys.add(entry.playerId);
  const base=snapshots[3];
  pool.push({id:`player-rival-${entry.playerId}`,name:entry.playerName,round:3,trainer:base.trainer,gold:base.gold,chews:base.chews,board:base.board,bench:base.bench,snapshots,playerKey:entry.playerId,isPlayer:true});
}
fs.writeFileSync(path.join(root,'pool.json'),`${JSON.stringify(pool,null,2)}\n`);
console.log(`Built pool with ${pool.length} entries (${accepted.length} submitted teams and ${rivalKeys.size} returning player rivals).`);
