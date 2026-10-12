const $=s=>document.querySelector(s),TABS=["Map","Notes","Lab","Prep","Drill","Cards"];
let EL=[],BY={};const rnd=a=>a[Math.floor(Math.random()*a.length)];
const SUP={"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
const sup=s=>s.replace(/([spdf])(\d+)/g,(m,a,b)=>a+b.split("").map(c=>SUP[c]).join(""));
const COL={Alkali:"#ff9a8a",Alkaline:"#ffcf8a",Transition:"#f6e58d",Poor:"#b8e994",Metalloid:"#7ed6df",Nonmetal:"#a3d8ff",Noble:"#d6a2ff",Lanthanoid:"#ffb8d9",Actinoid:"#f0a6c0",Unknown:"#bbb"};
const CATNAME={Alkali:"alkali metal",Alkaline:"alkaline earth metal",Transition:"transition metal",Poor:"post-transition metal",Metalloid:"metalloid",Nonmetal:"nonmetal",Noble:"noble gas",Lanthanoid:"lanthanide",Actinoid:"actinide",Unknown:"unknown"};
function pos(z){const P=[2,10,18,36,54,86,118];let p=P.findIndex(x=>z<=x)+1,s=p==1?1:P[p-2]+1,o=z-s+1,g;
 if(p==1)g=z==1?1:18;else if(p<=3)g=o<=2?o:o+10;else if(p<=5)g=o;else{if(o<=2)g=o;else if(o<=17)return{p,g:null,row:p+3,col:o+1};else g=o-14}
 return{p,g,row:p,col:g}}
function valenceMain(e){const g=e.g;if(e.z==2)return 2;if(g==null||(g>=3&&g<=12))return null;return g<=2?g:g-10}
const TMION={Sc:"Sc³⁺",Ti:"Ti⁴⁺",V:"V³⁺",Cr:"Cr³⁺ (also Cr²⁺)",Mn:"Mn²⁺",Fe:"Fe²⁺ / Fe³⁺",Co:"Co²⁺ / Co³⁺",Ni:"Ni²⁺",Cu:"Cu⁺ / Cu²⁺",Zn:"Zn²⁺",Ag:"Ag⁺",Cd:"Cd²⁺",Au:"Au⁺ / Au³⁺",Hg:"Hg₂²⁺ (mercury(I)) / Hg²⁺",Sn:"Sn²⁺ / Sn⁴⁺",Pb:"Pb²⁺ / Pb⁴⁺",Tl:"Tl⁺",Bi:"Bi³⁺"};
function commonIon(e){if(TMION[e.s])return TMION[e.s];if(e.s=="H")return"H⁺ (H⁻ hydride)";const g=e.g;
 if(g==1)return e.s+"⁺";if(g==2)return e.s+"²⁺";if(g==13&&e.z>5)return e.s+"³⁺";if(g==15&&e.z<=15)return e.s+"³⁻";if(g==16&&e.z<=52)return e.s+"²⁻";if(g==17&&e.z<=53)return e.s+"⁻";return"—"}
const NG={He:"1s2",Ne:"1s2 2s2 2p6",Ar:"1s2 2s2 2p6 3s2 3p6",Kr:"1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6",Xe:"1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6"};
function cfgMap(str){str=str.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>"⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c));const m={};
 str=str.replace(/\[(\w+)\]/,(x,g)=>" "+(NG[g]||"")+" ");(str.match(/\d[spdf]\d+/g)||[]).forEach(t=>{const k=t.slice(0,2);m[k]=(m[k]||0)+ +t.slice(2)});return m}
const sameCfg=(a,b)=>{const A=cfgMap(a),B=cfgMap(b),k=new Set([...Object.keys(A),...Object.keys(B)]);for(const x of k)if((A[x]||0)!=(B[x]||0))return false;return Object.keys(A).length>0};
const ORDER="1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p".split(" ");
function aufbau(z){let r=[],n=z;for(const o of ORDER){if(n<=0)break;const c=Math.min(n,{s:2,p:6,d:10,f:14}[o[1]]);r.push(o+c);n-=c}return r.join(" ")}
function unpaired(cfg){const m=cfgMap(cfg);let u=0;for(const k in m){const orb={s:1,p:3,d:5,f:7}[k[1]],e=m[k];u+=e<=orb?e:2*orb-e}return u}
fetch("properties.json").then(r=>r.json()).then(d=>{EL=d.slice(1).map(x=>{const z=+x.atomic,p=pos(z);const e={z,s:x.symbol,mass:x.weight,cat:x.series,en:x.electroneg?+x.electroneg:null,rad:x.radius&&x.radius.covalent?+x.radius.covalent:null,
 ie:x.ionize&&x.ionize["1"]?+x.ionize["1"]:null,ea:x.affinity!=null?+x.affinity:null,dens:x.density&&(x.density.stp||x.density.liquid),melt:x.melt,boil:x.boil,cfg:x.electronstring||"",...p};
 e.val=valenceMain(e);e.ion=commonIon(e);return e});EL.forEach(e=>BY[e.s]=e);buildPT();route()});
// ---------- periodic table side panel ----------
function heatColor(v,min,max){if(v==null||isNaN(v))return"#555";const t=(v-min)/(max-min);return`hsl(${220-220*t},70%,${55+10*t}%)`}
function buildPT(){const h=$("#heat").value,pt=$("#pt");pt.innerHTML="";let mm=null;
 if(h){const vs=EL.map(e=>e[h]).filter(v=>v!=null&&v>0);mm=[Math.min(...vs),Math.max(...vs)]}
 EL.forEach(e=>{const d=document.createElement("div");d.className="el";d.style.gridRow=e.row+(e.row>7?1:0);d.style.gridColumn=e.col;
  d.style.background=h?heatColor(e[h],...mm):COL[e.cat]||"#999";d.innerHTML=`<b>${e.s}</b>${e.z}`;d.title=e.s;d.onclick=ev=>elPop(e,ev);pt.appendChild(d)});
 const g=document.createElement("div");g.className="gap";g.style.gridRow=8;pt.appendChild(g);
 $("#legend").innerHTML=h?`Low → high ${h.toUpperCase()} (gray = no data)`:Object.keys(COL).map(k=>`<span style="background:${COL[k]}">${CATNAME[k]}</span>`).join("")}
$("#heat").onchange=buildPT;$("#ptToggle").onclick=()=>$("#side").classList.toggle("open");$("#ptClose").onclick=()=>$("#side").classList.remove("open");
// ---------- popups ----------
function showPop(html,ev){const p=$("#pop");p.innerHTML='<span class="x">✕</span>'+html;p.classList.remove("hidden");
 const x=Math.min(ev.clientX+12,innerWidth-360),y=Math.min(ev.clientY+12,innerHeight-p.offsetHeight-10);p.style.left=x+"px";p.style.top=Math.max(8,y)+"px";p.querySelector(".x").onclick=()=>p.classList.add("hidden");
 p.querySelectorAll(".term").forEach(t=>t.onclick=e=>{e.stopPropagation();termPop(t.dataset.t,e)})}
document.addEventListener("click",e=>{if(!e.target.closest("#pop,.el,.term,.ionlink"))$("#pop").classList.add("hidden")});
function trendText(e){if(!e.g||(e.g>=3&&e.g<=12))return"Transition/inner-transition metal. Ch 3–4 trends focus on main-group elements.";
 const per=EL.filter(x=>x.p==e.p&&x.g&&(x.g<=2||x.g>=13)&&x.g!=18&&x.rad),grp=EL.filter(x=>x.g==e.g&&x.rad);
 const rk=(arr,k,desc)=>{const s=arr.filter(x=>x[k]!=null).sort((a,b)=>desc?b[k]-a[k]:a[k]-b[k]);return s.findIndex(x=>x==e)+1+" of "+s.length};
 return`Group ${e.g}, period ${e.p}.${e.g==18?" Noble gas: high IE, no stable anion.":` Radius rank in period: ${rk(per,"rad",true)} (largest first). IE₁ rank in period: ${rk(per,"ie",true)} (highest first).`} Down group ${e.g}: radius ↑, IE ↓.`}
function elPop(e,ev){ev.stopPropagation();const pred=aufbau(e.z),exc=e.z<=36&&!sameCfg(pred,e.cfg);
 let note="";if(e.s=="Cr")note="<p class='ok'>Exception: predicted [Ar] 4s² 3d⁴ → actual [Ar] 4s¹ 3d⁵ (half-filled d). <span class='term' data-t='Cr'>why</span></p>";
 if(e.s=="Cu")note="<p class='ok'>Exception: predicted [Ar] 4s² 3d⁹ → actual [Ar] 4s¹ 3d¹⁰ (filled d). <span class='term' data-t='Cu'>why</span></p>";
 if(e.s=="Hg")note="<p>Mercury(I) is <span class='term' data-t='Hg2^2+'>Hg₂²⁺</span>, so Hg₂Cl₂.</p>";
 const z=e.z<=36?`<br>Unpaired e⁻: ${unpaired(e.cfg)} (Hund)`:"";
 showPop(`<h3>${e.s} · ${e.z}</h3><div>${CATNAME[e.cat]||e.cat} · ${e.mass} g/mol</div><p><b>Config:</b> ${sup(e.cfg)}${exc&&!note?" (differs from aufbau prediction)":""}${z}</p>${note}
 <p>EN ${e.en??"—"} · radius ${e.rad??"—"} pm · IE₁ ${e.ie??"—"} kJ/mol · affinity ${e.ea??"—"} kJ/mol<br>Valence e⁻: ${e.val??"varies"} · Common ion: ${e.ion}</p><p style="font-size:12px">${trendText(e)}</p>`,ev)}
function termPop(t,ev){showPop(`<h3>${t}</h3><p>${TERMS[t]||""}</p>`,ev)}
const termify=s=>s.replace(/\[([^\]]+)\]/g,(m,t)=>TERMS[t]?`<span class="term" data-t="${t}">${t.replace("Hg2^2+","Hg₂²⁺").replace("O2^2-","O₂²⁻").replace("C2H3O2-","C₂H₃O₂⁻")}</span>`:m);
function bindTerms(root){root.querySelectorAll(".term").forEach(t=>t.onclick=e=>{e.stopPropagation();termPop(t.dataset.t,e)})}
// ---------- properties table ----------
$("#tableBtn").onclick=()=>{const m=$("#modal");const cols=[["z","#"],["s","Symbol"],["cat","Category"],["en","EN"],["rad","Radius (pm)"],["ie","IE₁ (kJ/mol)"],["ea","Affinity (kJ/mol)"],["mass","Mass (g/mol)"],["dens","Density (kg/m³)"],["melt","Melt (K)"],["boil","Boil (K)"],["val","Valence e⁻"],["ion","Common ion"]];
 let sk="z",dir=1;const draw=()=>{const rows=[...EL].sort((a,b)=>{let x=a[sk],y=b[sk];if(!isNaN(+x)&&!isNaN(+y)&&x!=null&&y!=null)return(+x-+y)*dir;return String(x??"").localeCompare(String(y??""))*dir});
  m.innerHTML=`<button class="btn" id="mclose" style="float:right">Close</button><h2>Properties table</h2><p>Click a header to sort. Click a row to open its popup.</p><table><tr>${cols.map(c=>`<th data-k="${c[0]}">${c[1]}</th>`).join("")}</tr>${rows.map(e=>`<tr data-s="${e.s}">${cols.map(c=>`<td>${c[0]=="cat"?CATNAME[e[c[0]]]||"":e[c[0]]??"—"}</td>`).join("")}</tr>`).join("")}</table>`;
  m.querySelectorAll("th").forEach(th=>th.onclick=()=>{dir=sk==th.dataset.k?-dir:1;sk=th.dataset.k;draw()});m.querySelectorAll("tr[data-s]").forEach(tr=>tr.onclick=ev=>elPop(BY[tr.dataset.s],ev));$("#mclose").onclick=()=>m.classList.add("hidden")};
 draw();m.classList.remove("hidden")};
// ---------- routing ----------
$("#tabs").innerHTML=TABS.map(t=>`<button data-t="${t}">${t}</button>`).join("");document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>location.hash=b.dataset.t);
addEventListener("hashchange",route);
function route(){if(!EL.length)return;const[t,sub]=(location.hash.slice(1)||"Map").split("/");document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));
 const m=$("#main");m.innerHTML="";({Map:MapTab,Notes,Lab,Prep,Drill,Cards}[t]||MapTab)(m,sub);bindTerms(m);if(sub){const a=document.getElementById(sub);if(a)a.scrollIntoView()}}
// ---------- Map: study guide checklist ----------
function MapTab(m){const done=JSON.parse(localStorage.sg||"{}");
 m.innerHTML=`<h2>Study Guide for Exam 2 Gen Chem 1045-3</h2><p>Check items off as you master them. Links open the matching tab.</p>`+GUIDE.map(([ch,items],ci)=>`<div class="card guide"><h3>${ch}</h3><ul>${items.map(([t,tab,sub],i)=>{const k=ci+"-"+i;
  return`<li><label><input type="checkbox" data-k="${k}" ${done[k]?"checked":""}> ${t}</label><a href="#${tab}${sub?"/"+sub:""}">→ ${tab}</a></li>`}).join("")}</ul></div>`).join("")+`<p id="prog"></p>`;
 const upd=()=>{const n=GUIDE.reduce((a,g)=>a+g[1].length,0);$("#prog").textContent=`${Object.values(done).filter(Boolean).length} / ${n} checked`};upd();
 m.querySelectorAll("input[type=checkbox]").forEach(c=>c.onchange=()=>{done[c.dataset.k]=c.checked;localStorage.sg=JSON.stringify(done);upd()})}
function Notes(m){m.innerHTML="<h2>Notes</h2><p>Short. Click any <span class='term' data-t='photon'>gold term</span> for a popup.</p>"+NOTES.map(([id,t,ls])=>`<div class="card" id="${id}"><h3>${t}</h3><ul>${ls.map(l=>`<li>${termify(l)}</li>`).join("")}</ul></div>`).join("")
 +`<div class="card"><h3>Polyatomic ions</h3>${POLY.map(p=>`${p[0]} ${p[1]}`).join(" · ")}</div>`}
function Cards(m){let deck=[...CARDS,...POLY.map(p=>[p[0],p[1]])],i=0,f=false;const draw=()=>{const c=deck[i];m.innerHTML=`<h2>Cards</h2><div class="card flip" id="fc">${f?c[1]:c[0]}</div>
 <button class="btn sec" id="pv">◀</button><button class="btn" id="fl">Flip</button><button class="btn sec" id="nx">▶</button><button class="btn sec" id="sh">Shuffle</button> ${i+1}/${deck.length}`;
 $("#fc").onclick=$("#fl").onclick=()=>{f=!f;draw()};$("#nx").onclick=()=>{i=(i+1)%deck.length;f=false;draw()};$("#pv").onclick=()=>{i=(i-1+deck.length)%deck.length;f=false;draw()};$("#sh").onclick=()=>{deck.sort(()=>Math.random()-.5);i=0;f=false;draw()}};draw()}
// ---------- Lab: Bohr + Lewis ----------
function Lab(m,sub){m.innerHTML=`<h2>Lab</h2><div class="card" id="bohr"><h3>H emission lines (Bohr)</h3>n_initial <select id="ni">${[2,3,4,5,6,7].map(n=>`<option ${n==3?"selected":""}>${n}</option>`)}</select> → n_final <select id="nf">${[1,2,3,4,5,6].map(n=>`<option ${n==2?"selected":""}>${n}</option>`)}</select>
 <span id="bout"></span><svg id="spec" width="600" height="40"></svg></div><div class="card" id="lewis"><h3>Lewis structure builder</h3><div id="lewisRoot"></div></div>`;
 const calc=()=>{const ni=+$("#ni").value,nf=+$("#nf").value;if(ni<=nf){$("#bout").innerHTML=" <span class='bad'>n_initial must be greater than n_final for emission</span>";return}
  const dE=2.179e-18*(1/nf**2-1/ni**2),lam=6.626e-34*2.998e8/dE*1e9;const vis=lam>=380&&lam<=750;
  $("#bout").innerHTML=` ΔE = ${dE.toExponential(3)} J · λ = ${lam.toFixed(1)} nm · ${vis?"visible":lam<380?"UV":"IR"}`;
  const x=vis?(lam-380)/370*600:lam<380?2:598,hue=vis?Math.max(0,270-(lam-380)/(370)*270):0;$("#spec").innerHTML=`<defs><linearGradient id="g"><stop offset="0" stop-color="#7a00ff"/><stop offset=".3" stop-color="#00f"/><stop offset=".5" stop-color="#0f0"/><stop offset=".7" stop-color="#ff0"/><stop offset="1" stop-color="#f00"/></linearGradient></defs><rect width="600" height="40" fill="url(#g)" opacity=".25"/><rect x="${x-2}" width="4" height="40" fill="${vis?`hsl(${hue},100%,60%)`:"#fff"}"/>`};
 $("#ni").onchange=$("#nf").onchange=calc;calc();window.LewisApp&&LewisApp($("#lewisRoot"))}
// ---------- question generators ----------
const norm=s=>s.toLowerCase().replace(/\s+/g," ").trim();
const nf=s=>s.replace(/\s+/g,"").replace(/[₀-₉]/g,c=>"₀₁₂₃₄₅₆₇₈₉".indexOf(c));
const SP=()=>EL.filter(e=>e.z<=36&&!(e.z>=21&&e.z<=30));
const MAINS=()=>EL.filter(e=>e.z<=54&&e.g&&(e.g<=2||e.g>=13)&&e.g!=18);
const GEN={
qn:{t:"Quantum numbers (n, l, ml, ms)",g(){const n=1+Math.floor(Math.random()*4),l=Math.floor(Math.random()*(n+1)),ml=Math.floor(Math.random()*5)-2,ms=rnd(["+1/2","-1/2"]);
 const ok=l<=n-1&&Math.abs(ml)<=l;return{q:`Is the set n=${n}, l=${l}, ml=${ml}, ms=${ms} allowed?`,c:["allowed","not allowed"],a:ok?"allowed":"not allowed",why:ok?"l ≤ n−1 and |ml| ≤ l.":l>n-1?`l must be 0…${n-1}.`:`ml must be −${l}…+${l}.`}}},
qn2el:{t:"Quantum numbers → element",g(){const e=rnd(SP());const m=cfgMap(e.cfg),ks=Object.keys(m),last=ks.filter(k=>k[1]=="p").sort().pop()||ks.filter(k=>k[1]=="s").sort().pop();
 const n=+last[0],l=last[1]=="p"?1:0,k=m[last],o=2*l+1,ml=k<=o?-l+k-1:-l+k-o-1,ms=k<=o?"+1/2":"−1/2";
 return{q:`The last electron added (aufbau) has n=${n}, l=${l}, ml=${ml}, ms=${ms}. Which element? <br><small>Convention: fill ml = −l…+l with ms = +½ first, then pair with −½.</small>`,a:e.s,text:1,why:`${last}${k}: ${sup(e.cfg)} → ${e.s}.`}}},
config:{t:"Electron configuration (noble-gas shorthand)",g(){const e=rnd(EL.filter(x=>x.z<=36&&x.z>2).concat([BY.Cr,BY.Cu]));return{q:`Write the abbreviated configuration of ${e.s} (e.g. [Ne] 3s2 3p1).`,text:1,a:e.cfg,chk:x=>sameCfg(x,e.cfg),why:sup(e.cfg)+(e.s=="Cr"||e.s=="Cu"?" (exception)":"")}}},
unpaired:{t:"Orbital diagrams / Hund's rule",g(){const e=rnd(EL.filter(x=>x.z<=36).concat([BY.Cr,BY.Cu,BY.Fe,BY.N,BY.O]));const u=unpaired(e.cfg);return{q:`How many unpaired electrons does a ground-state ${e.s} atom have?`,text:1,a:String(u),why:`${sup(e.cfg)}: Hund's rule gives ${u} unpaired.`}}},
trend:{t:"Periodic trends",g(){const k=rnd(["rad","ie","ea"]),L={rad:"larger atomic radius",ie:"higher first ionization energy",ea:"more energy released on gaining an electron (electron affinity)"}[k];
 let a,b,tries=0;do{a=rnd(MAINS());const same=Math.random()<.5;b=rnd(MAINS().filter(x=>x!=a&&(same?x.p==a.p:x.g==a.g)));tries++}while((!b||a[k]==null||b[k]==null||a[k]==b[k]||(k=="ea"&&(a.ea<=0||b.ea<=0||Math.abs(a.ea-b.ea)<20)))&&tries<200);
 const w=a[k]>b[k]?a:b;return{q:`Which has the ${L}: ${a.s} or ${b.s}?`,c:[a.s,b.s],a:w.s,why:`${a.s} ${a[k]}, ${b.s} ${b[k]} (${k=="rad"?"pm":"kJ/mol"}). ${a.p==b.p?"Same period":"Same group"}.`}}},
bondtype:{t:"Ionic / polar / nonpolar (ΔEN)",g(){let a,b,d;do{a=rnd(MAINS().filter(x=>x.en));b=rnd(MAINS().filter(x=>x.en));d=Math.abs(a.en-b.en)}while(Math.abs(d-.4)<.06||Math.abs(d-1.8)<.06);
 const ans=d<.4?"nonpolar covalent":d<=1.8?"polar covalent":"ionic";return{q:`Bond between ${a.s} (EN ${a.en}) and ${b.s} (EN ${b.en})?`,c:["nonpolar covalent","polar covalent","ionic"],a:ans,why:`ΔEN = ${d.toFixed(2)}: <0.4 nonpolar, 0.4–1.8 polar, >1.8 ionic.`}}},
name:{t:"Naming drills",g(){const[f,n,af=[],an=[]]=rnd(NAMES);if(Math.random()<.5)return{q:`Name: <b>${f}</b>`,text:1,a:n,chk:x=>[n,...an].map(norm).includes(norm(x).replace(/\s*\(\s*/g,"(").replace(/\s*\)/g,")")),why:n};
 return{q:`Formula for <b>${n}</b>`,text:1,a:f,chk:x=>[f,...af].map(nf).includes(nf(x)),why:f+(af.length?` (or ${af.join(", ")})`:"")+" — charges balance; parentheses only if a polyatomic count > 1."}}},
dots:{t:"Lewis dot symbols",g(){const e=rnd(EL.filter(x=>x.z<=20||(x.z>=31&&x.z<=36)));return{q:`How many dots in the Lewis symbol of ${e.s}?`,text:1,a:String(e.val),why:`${e.s}: group ${e.g} → ${e.val} valence e⁻.`}}},
geo:{t:"Geometry, angles, polarity",g(){const mo=rnd(MOLS),G=mo.geo,k=rnd(G.pol?["eg","mg","ang","pol"]:["eg","mg","ang"]);const C={eg:EG,mg:MG,ang:ANG,pol:["polar","nonpolar"]}[k];
 return{q:`${mo.f}${G.about?" (around "+G.about+")":""}: ${{eg:"electron geometry",mg:"molecular geometry",ang:"bond angle",pol:"polarity"}[k]}?`,c:C,a:G[k],why:`${mo.f}: ${G.eg} / ${G.mg} / ${G.ang}°${G.pol?" / "+G.pol:""}.`}}},
light:{t:"Light & photons",g(){const lam=200+Math.round(Math.random()*600),E=6.626e-34*2.998e8/(lam*1e-9),nu=2.998e8/(lam*1e-9);if(Math.random()<.5)return{q:`Energy (J) of one photon with λ = ${lam} nm?`,text:1,num:E,a:E.toExponential(3)+" J",why:"E = hc/λ"};
 return{q:`Frequency (s⁻¹) of light with λ = ${lam} nm?`,text:1,num:nu,a:nu.toExponential(3)+" s⁻¹",why:"ν = c/λ"}}},
bohr:{t:"H emission (Bohr)",g(){const nf=rnd([1,2,3]),ni=nf+1+Math.floor(Math.random()*3);const dE=2.179e-18*(1/nf**2-1/ni**2),lam=6.626e-34*2.998e8/dE*1e9;return{q:`λ (nm) emitted when H's electron drops n=${ni} → n=${nf}?`,text:1,num:lam,a:lam.toFixed(1)+" nm",why:"ΔE = 2.179×10⁻¹⁸(1/n_f² − 1/n_i²); λ = hc/ΔE"}}}};
const EG=["linear","trigonal planar","tetrahedral","trigonal bipyramidal","octahedral"],MG=["linear","bent","trigonal planar","trigonal pyramidal","tetrahedral","seesaw","T-shaped","trigonal bipyramidal","square planar","octahedral"],ANG=["180","120","109.5","<120","<109.5","90","<90","90 & 120","<90 & <120"];
function grade(Q,x){if(Q.chk)return Q.chk(x);if(Q.num){const v=parseFloat(x.replace(/×10\^?/,"e").replace(/x10\^?/i,"e"));return Math.abs(v-Q.num)/Q.num<.02}return norm(x)==norm(Q.a)}
function askUI(box,Q,done){box.innerHTML=`<div class="card"><p>${Q.q}</p>${Q.c?Q.c.map(c=>`<button class="btn sec ch">${c}</button>`).join(""):`<input id="ans" size="30" autocomplete="off"> <button class="btn" id="go">Check</button>`}<div id="fb"></div></div>`;
 const fin=x=>{const ok=grade(Q,x);box.querySelector("#fb").innerHTML=`<p class="${ok?"ok":"bad"}">${ok?"✔ Correct":"✘ Answer: "+Q.a}</p><p>${Q.why}</p>`;done(ok,x)};
 box.querySelectorAll(".ch").forEach(b=>b.onclick=()=>fin(b.textContent));const i=box.querySelector("#ans");if(i){i.focus();i.onkeydown=e=>e.key=="Enter"&&fin(i.value);box.querySelector("#go").onclick=()=>fin(i.value)}}
function Drill(m,sub){const topic=GEN[sub]?sub:"qn2el";let s=0,n=0;m.innerHTML=`<h2>Drill</h2><select id="topic">${Object.entries(GEN).map(([k,v])=>`<option value="${k}" ${k==topic?"selected":""}>${v.t}</option>`).join("")}</select> <span id="sc"></span><div id="qb"></div><button class="btn" id="nxt">Next ▶</button>`;
 const next=()=>askUI($("#qb"),GEN[$("#topic").value].g(),ok=>{n++;s+=ok;$("#sc").textContent=`${s}/${n}`});$("#topic").onchange=()=>{location.hash="Drill/"+$("#topic").value};$("#nxt").onclick=next;next()}
function Prep(m){m.innerHTML=`<h2>Prep: timed test</h2><div class="card">Questions <select id="nq"><option>10</option><option>20</option></select> Minutes <select id="mins"><option>10</option><option>5</option><option>20</option></select>
 <button class="btn" id="start">Start</button><p>Random mix of every study guide topic. You see each grade right away; a summary shows at the end.</p></div><div id="tb"></div>`;
 $("#start").onclick=()=>{const N=+$("#nq").value,end=Date.now()+60000*+$("#mins").value,ks=Object.keys(GEN),log=[];let i=0,tm;const tb=$("#tb");
  const finish=()=>{clearInterval(tm);const sc=log.filter(l=>l.ok).length;tb.innerHTML=`<div class="card"><h3>Score ${sc}/${N}</h3>${log.map((l,j)=>`<p class="${l.ok?"ok":"bad"}">${j+1}. ${l.Q.q.replace(/<br>.*$/,"")} — you: ${l.x||"(blank)"}${l.ok?"":" → "+l.Q.a}</p>`).join("")}</div>`};
  const one=()=>{if(i>=N)return finish();tb.innerHTML=`<p id="clk"></p><p>Q${i+1}/${N}</p><div id="qq"></div>`;const Q=GEN[ks[i%ks.length]].g();
   askUI($("#qq"),Q,(ok,x)=>{log.push({Q,ok,x});i++;const b=document.createElement("button");b.className="btn";b.textContent=i>=N?"Finish":"Next ▶";b.onclick=one;$("#qq").appendChild(b)})};
  ks.sort(()=>Math.random()-.5);tm=setInterval(()=>{const r=Math.max(0,end-Date.now());const c=$("#clk");if(c)c.textContent=`⏱ ${Math.floor(r/60000)}:${String(Math.floor(r/1000)%60).padStart(2,"0")}`;if(!r){while(log.length<N)log.push({Q:{q:"(time up)",a:"—"},ok:false});finish()}},500);one()}}
