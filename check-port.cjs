const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync('fig-forth.asm','utf8');
const symbols={};let pc=0; const refs=[];
function expr(x){return Function('return ('+x.replace(/'([^']*)'/g,(_,v)=>v.charCodeAt(0)).replace(/\b([0-9][0-9A-F]*)H\b/gi,(_,v)=>parseInt(v,16)).replace(/\$/g,''+pc).replace(/\b[A-Z][A-Z0-9]*\b/g,v=>{if(!(v in symbols))throw Error('Undefined '+v);return symbols[v];})+')')();}
function args(s){return s.match(/(?:'[^']*'|[^,'])+/g)||[];}
const three=new Set('LXI SHLD LHLD STA LDA JMP JNZ JZ JNC JC JPO JPE JP JM CALL CNZ CZ CNC CC CPO CPE CP CM'.split(' '));
const two=new Set('MVI ADI ACI SUI SBI ANI XRI ORI CPI IN OUT'.split(' '));
const one=new Set('NOP MOV STAX LDAX INX DCX INR DCR DAD RLC RRC RAL RAR DAA CMA STC CMC HLT ADD ADC SUB SBB ANA XRA ORA CMP RET RNZ RZ RNC RC RPO RPE RP RM PUSH POP XTHL PCHL XCHG DI EI SPHL RST'.split(' '));
for(let [i,line] of src.split(/\r?\n/).entries()){
line=line.match(/(?:'[^']*'|[^;'])*/)[0].trim();if(!line)continue;
let m=line.match(/^(\w+)\s+EQU\s+(.+)$/i);if(m){assert(!(m[1] in symbols),'Duplicate '+m[1]);symbols[m[1]]=expr(m[2]);continue;}
m=line.match(/^(\w+):\s*(.*)$/);if(m){assert(!(m[1] in symbols),'Duplicate '+m[1]);symbols[m[1]]=pc;line=m[2];}
if(!line)continue;let [_,op,rest='']=line.match(/^(\S+)\s*(.*)$/);op=op.toUpperCase();
if(['TITLE','.8080','ASEG','PAGE','IF','.ERROR','ENDIF','END'].includes(op))continue;
if(op==='ORG'){pc=expr(rest);continue;}if(op==='DS'){pc+=expr(rest);continue;}
if(op==='DB'){for(const a of args(rest)){const t=a.trim();pc+=/^'[^']*'$/.test(t)?t.length-2:1;refs.push([i,t]);}continue;}
if(op==='DW'){pc+=args(rest).length*2;refs.push([i,rest]);continue;}
assert(three.has(op)||two.has(op)||one.has(op),`Unknown ${op} line ${i+1}`);pc+=three.has(op)?3:two.has(op)?2:1;
if(three.has(op)||two.has(op))refs.push([i,rest]);
}
for(const [i,r] of refs){for(const t of r.replace(/'[^']*'/g,'').replace(/\b[0-9][0-9A-F]*H\b/gi,'').match(/\b[A-Z][A-Z0-9]*\b/g)||[]){assert(t in symbols||'A B C D E H L M SP PSW'.split(' ').includes(t),`Unresolved ${t} line ${i+1}`);}}
assert(symbols.INITDP+256<symbols.INITS0);assert(symbols.EM===0x7600);assert(!/\b(?:CALL\s+IOS|LHLD\s+1\b|JMP\s+0\b)/.test(src));
for(const k of ['ORIG','INITDP','INITS0','INITR0','BUF1','EM'])console.log(k+' = '+symbols[k].toString(16).toUpperCase()+'H');
console.log('Static syntax, symbol references and RAM layout checks passed (not an M80 assembly).');

const shortNames=new Set();for(const k of Object.keys(symbols)){const n=k.slice(0,6);assert(!shortNames.has(n),'M80 six-character collision: '+k);shortNames.add(n);}
for(const k of ['UPDAT','DRONE','BUFFE','BLOCK','SETIO','SETDRV','TSCALC','SECRD','SECWT','RSLW','FLUSH','LOAD','ARROW','LIST','INDEX','TRIAD'])assert(new RegExp('^'+k+':\\s+DW\\s+NODISK\\s*$','m').test(src),k+' must reject disk access');
assert((src.match(/^\s+END\s+ORIG\s*$/gm)||[]).length===1);
console.log('Disk entry points and M80 six-character symbol uniqueness passed.');
