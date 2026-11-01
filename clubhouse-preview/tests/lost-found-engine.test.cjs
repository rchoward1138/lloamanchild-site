const assert = require('node:assert/strict');
const {fresh,restore,stage,act} = require('../lost-found-engine.js');
let checks=0;
function check(condition){assert.ok(condition);checks++;}
for(const action of ['unlock','pencil','rewind','rewind-all','load','play']) check(!act(fresh(),action,'640').ok);
let s=act(fresh(),'start').state;
for(const action of ['rewind','rewind-all','load','play']) check(!act(s,action).ok);
for(const code of ['580','027640','64','064','abc','']) {const r=act(s,'unlock',code);check(!r.ok&&!r.state.drawerOpen);}
s=act(s,'pencil').state;check(s.hasPencil&&!s.drawerOpen);
s=act(s,'unlock','640').state;check(s.drawerOpen&&s.hasPencil&&stage(s)===2);
for(let turn=1;turn<=4;turn++){s=act(s,'rewind').state;check(s.turns===turn);if(turn<4)check(!act(s,'load').ok);}
check(stage(s)===3&&act(s,'rewind').state.turns===4);
check(!act(s,'play').ok);
s=act(s,'load').state;check(s.loaded&&!s.won);
s=act(s,'play').state;check(s.won);
assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);checks++;
let shortcut=act(fresh(),'start').state;
shortcut=act(shortcut,'unlock','640').state;
check(!act(shortcut,'rewind-all').ok);
shortcut=act(shortcut,'pencil').state;
shortcut=act(shortcut,'rewind-all').state;check(shortcut.turns===4);
shortcut=act(shortcut,'load').state;shortcut=act(shortcut,'play').state;
assert.deepEqual(shortcut,s);checks++;
for(const bad of [null,{}, {version:1}, {version:2,won:true,loaded:true,turns:4}]) {check(!restore(bad).won);}
check(restore({...s,turns:-5}).turns===0);
check(!restore({...s,hasPencil:false}).loaded);
check(!restore({...s,drawerOpen:false}).won);
check(!restore({...s,turns:NaN}).won);
console.log(`${checks} Lost & Found progression checks passed.`);
