const RIVAL_ROUNDS=[3,6,9];

export function normalize(input,catalog){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid team submission');
  const round=input.round,playerId=input.playerId;
  const playerName=typeof input.playerName==='string'?input.playerName.trim().normalize('NFC').replace(/\s+/gu,' '):'';
  const validName=[...playerName].length>=2&&[...playerName].length<=20&&/[\p{L}\p{N}]/u.test(playerName)&&/^[\p{L}\p{N}_ -]+$/u.test(playerName);
  if(typeof playerId!=='string'||!/^[a-f0-9]{32}$/.test(playerId)||!validName)throw new Error('A valid public trainer name and player ID are required');
  if(!Number.isInteger(round)||round<1||round>=catalog.bossRound)throw new Error('Only regular match rounds can be submitted');
  if(!Array.isArray(input.board)||input.board.length!==6||!input.board.some(Boolean))throw new Error('Team must have a non-empty six-slot board');
  if(!catalog.trainers.includes(input.trainer))throw new Error('Unknown trainer');
  if(!Number.isInteger(input.gold)||input.gold<0||input.gold>1000)throw new Error('Invalid unspent gold');
  const normalizeChews=chews=>{
    if(!Array.isArray(chews)||chews.length>catalog.chews.length||new Set(chews).size!==chews.length||chews.some(id=>!catalog.chews.includes(id)))throw new Error('Invalid team items');
    return [...chews];
  };
  const normalizeSlots=(board,slots,allowEmpty=false)=>{
    if(!Array.isArray(board)||board.length!==slots||(!allowEmpty&&!board.some(Boolean)))throw new Error(`Team must have ${allowEmpty?'':'a non-empty '}${slots}-slot ${slots===4?'bench':'board'}`);
    const normalized=board.map(mon=>{
      if(mon===null)return null;
      if(!mon||typeof mon!=='object'||!catalog.creatures.includes(mon.id)||!Number.isInteger(mon.level)||mon.level<1||mon.level>3)throw new Error('Unknown creature or invalid level');
      const bonus=mon.bonus??0,vigor=mon.vigor??0,drills=mon.drills??0,shiny=mon.shiny??false;
      if(!Number.isInteger(bonus)||bonus<0||bonus>1000||!Number.isInteger(vigor)||vigor<0||vigor>18||!Number.isInteger(drills)||drills<0||drills>3||vigor!==drills*6||bonus<drills*2||typeof shiny!=='boolean')throw new Error('Invalid creature training');
      return {id:mon.id,level:mon.level,bonus,vigor,drills,shiny};
    });
    return normalized;
  };
  const enforceLevel3Cap=(board,bench,boardRound)=>{
    const caps=catalog.level3Caps||{before3:0,before6:1,before9:3,from9:6};
    const level3Cap=boardRound<3?caps.before3:boardRound<6?caps.before6:boardRound<9?caps.before9:caps.from9;
    if([...board,...bench].filter(mon=>mon?.level===3).length>level3Cap)throw new Error('Team exceeds the round level-3 limits');
  };
  const chews=normalizeChews(input.chews),board=normalizeSlots(input.board,6),bench=normalizeSlots(input.bench??Array(4).fill(null),4,true),snapshots={};
  enforceLevel3Cap(board,bench,round);
  if(input.snapshots!==undefined&&(!input.snapshots||typeof input.snapshots!=='object'||Array.isArray(input.snapshots)))throw new Error('Invalid rival snapshots');
  for(const snapshotRound of RIVAL_ROUNDS){
    const source=input.snapshots?.[snapshotRound];
    if(source===undefined)continue;
    if(!source||typeof source!=='object'||Array.isArray(source)||source.round!==snapshotRound||snapshotRound>round)throw new Error('Invalid rival snapshot');
    const snapshotTrainer=source.trainer;
    if(!catalog.trainers.includes(snapshotTrainer))throw new Error('Unknown snapshot trainer');
    const snapshotGold=source.gold;
    if(!Number.isInteger(snapshotGold)||snapshotGold<0||snapshotGold>1000)throw new Error('Invalid snapshot gold');
    const snapshotBoard=normalizeSlots(source.board,6),snapshotBench=normalizeSlots(source.bench??Array(4).fill(null),4,true);
    enforceLevel3Cap(snapshotBoard,snapshotBench,snapshotRound);
    snapshots[snapshotRound]={round:snapshotRound,trainer:snapshotTrainer,gold:snapshotGold,chews:normalizeChews(source.chews),board:snapshotBoard,bench:snapshotBench};
  }
  return {round,playerId,playerName,trainer:input.trainer,gold:input.gold,chews,board,bench,snapshots};
}
