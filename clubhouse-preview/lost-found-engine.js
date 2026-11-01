(function(root){
  'use strict';
  const BEST_SCORE='027640';
  const fresh=()=>({version:2,started:false,drawerOpen:false,hasPencil:false,turns:0,loaded:false,won:false});
  function restore(value){
    if(!value||value.version!==2)return fresh();
    const s=fresh();s.started=value.started===true;
    s.drawerOpen=s.started&&value.drawerOpen===true;
    s.hasPencil=s.started&&value.hasPencil===true;
    s.turns=s.drawerOpen&&s.hasPencil?Math.max(0,Math.min(4,Number.isInteger(value.turns)?value.turns:0)):0;
    s.loaded=s.turns===4&&value.loaded===true;s.won=s.loaded&&value.won===true;return s;
  }
  function stage(s){return !s.drawerOpen?1:s.turns<4?2:3}
  function act(previous,action,value){
    const s=restore(previous);let message='';let ok=false;
    if(action==='start'){s.started=true;ok=true;}
    else if(!s.started)message='Select “Start looking” first.';
    else if(action==='pencil'){s.hasPencil=true;ok=true;message='Pencil collected. The original cassette-repair kit.';}
    else if(action==='unlock'){
      if(String(value).trim()===BEST_SCORE.slice(-3)){s.drawerOpen=true;ok=true;message='The drawer opens. Your mixtape is here—but the tape is loose.';}
      else message='That code did not open it. Nothing lost. Check the desk note and the BEST score on the TV.';
    }
    else if(action==='rewind'||action==='rewind-all'){
      if(!s.drawerOpen)message='Find the cassette in the desk drawer first.';
      else if(!s.hasPencil)message='You need the pencil from the pencil cup.';
      else{s.turns=action==='rewind-all'?4:Math.min(4,s.turns+1);ok=true;message=s.turns===4?'Tape repaired. It is ready for the cassette player.':'The loose loop is getting smaller. Keep turning.';}
    }
    else if(action==='load'){
      if(s.turns<4)message='Rewind the loose tape before loading the player.';
      else{s.loaded=true;ok=true;message='Cassette loaded. Press Play to finish.';}
    }
    else if(action==='play'){
      if(!s.loaded)message='Load the repaired cassette first.';
      else{s.won=true;ok=true;message='The mixtape lives. Road trip saved.';}
    }
    return {state:s,ok,message};
  }
  const api={BEST_SCORE,fresh,restore,stage,act};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MixtapeGame=api;
})(typeof window==='undefined'?{}:window);
