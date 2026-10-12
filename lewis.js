// Aktiv-style Lewis builder (own implementation). Atoms form a parent/child tree; positions come from
// even angular "sites" around each atom (bonds + lone pairs), like Aktiv's geometry templates — no free x/y.
const VAL={H:1,Be:2,B:3,C:4,N:5,O:6,F:7,Si:4,P:5,S:6,Cl:7,Xe:8};
function formulaCount(f){const c={};(f.replace(/[−⁻²³+]/g,"").match(/[A-Z][a-z]?\d*/g)||[]).forEach(t=>{const m=t.match(/([A-Z][a-z]?)(\d*)/);c[m[1]]=(c[m[1]]||0)+(+m[2]||1)});return c}
function LewisApp(root){
 let mol=MOLS[0],S,hist,sel=null,found;
 const reset=()=>{S={atoms:[],bonds:[]};hist=[];sel=null;found=new Set()};reset();
 const snap=()=>hist.push(JSON.stringify(S)),undo=()=>{if(hist.length){S=JSON.parse(hist.pop());sel=null;draw()}};
 const bondsOf=id=>S.bonds.filter(b=>b.a==id||b.b==id),bsum=id=>bondsOf(id).reduce((s,b)=>s+b.o,0);
 const fcCalc=a=>VAL[a.el]-2*a.lp-bsum(a.id);
 const need=()=>Object.entries(formulaCount(mol.f)).reduce((s,[e,n])=>s+VAL[e]*n,0)-mol.q;
 const drawn=()=>2*S.bonds.reduce((s,b)=>s+b.o,0)+2*S.atoms.reduce((s,a)=>s+a.lp,0);
 root.innerHTML=`<div class="row"><div><label>Molecule <select id="lm">${MOLS.map((m,i)=>`<option value="${i}">${m.f}${m.n?" ("+m.n+")":""}</option>`).join("")}</select></label>
 <p id="lhelp" style="max-width:520px;font-size:12.5px">1. Click an element to place the first atom (the central atom). 2. Select an atom, then click an element to bond a new atom to it. 3. Click a bond to cycle single → double → triple. 4. Use ± on the selected atom for lone pairs and formal charge. 5. Check.</p>
 <div id="pal"></div><svg id="lewisSvg" width="560" height="400"></svg></div>
 <div style="min-width:280px"><div class="card"><b>Valence electrons</b><div id="vc"></div></div><div class="card" id="selbox"></div>
 <button class="btn" id="chk">Check structure</button><button class="btn sec" id="und">Undo</button><button class="btn sec" id="clr">Clear</button><div id="lfb"></div><div id="geoq"></div></div></div>`;
 const svg=root.querySelector("#lewisSvg");
 root.querySelector("#lm").onchange=e=>{mol=MOLS[+e.target.value];reset();root.querySelector("#lfb").innerHTML=root.querySelector("#geoq").innerHTML="";draw()};
 root.querySelector("#und").onclick=undo;root.querySelector("#clr").onclick=()=>{snap();S={atoms:[],bonds:[]};sel=null;draw()};
 function addAtom(el){snap();const id=S.atoms.length?Math.max(...S.atoms.map(a=>a.id))+1:0;
  if(!S.atoms.length){S.atoms.push({id,el,parent:-1,lp:0,fc:0});sel=id}else{const p=sel??S.atoms[0].id;S.atoms.push({id,el,parent:p,lp:0,fc:0});S.bonds.push({a:p,b:id,o:1})}draw()}
 function layout(){const P={},A={};const r0=S.atoms.find(a=>a.parent<0);if(!r0)return{P,A};P[r0.id]=[280,200];
  const place=(a,inAng)=>{const kids=S.atoms.filter(x=>x.parent==a.id),k=kids.length+a.lp+(a.parent<0?0:1);const step=360/Math.max(k,1);
   let start=a.parent<0?(a.lp?270:(kids.length==1?180:90)):inAng+180;const ang=[];for(let i=0;i<k;i++)ang.push((start+i*step)%360);
   let slots=a.parent<0?ang:ang.slice(1);
   if(a.parent<0&&a.lp){slots=[...ang.slice(a.lp),...ang.slice(0,a.lp)]} // lone pairs on top, like Aktiv's BENT templates
   kids.forEach((c,i)=>{const t=slots[i]*Math.PI/180,L=c.el=="H"?62:78;P[c.id]=[P[a.id][0]+L*Math.cos(t),P[a.id][1]+L*Math.sin(t)];place(c,slots[i])});
   A[a.id]=slots.slice(kids.length)};place(r0,0);return{P,A}}
 function draw(){const{P,A}=layout();let h="";
  S.bonds.forEach((b,i)=>{const[x1,y1]=P[b.a],[x2,y2]=P[b.b],dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L*5,ny=dx/L*5,sx=dx/L*16,sy=dy/L*16;
   const offs=b.o==1?[0]:b.o==2?[-1,1]:[-1.6,0,1.6];h+=`<g class="bd" data-i="${i}" style="cursor:pointer"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="18"/>`+offs.map(o=>`<line x1="${x1+sx+nx*o}" y1="${y1+sy+ny*o}" x2="${x2-sx+nx*o}" y2="${y2-sy+ny*o}" stroke="#cfd8ef" stroke-width="2.5"/>`).join("")+"</g>"});
  S.atoms.forEach(a=>{const[x,y]=P[a.id];(A[a.id]||[]).forEach(t=>{t*=Math.PI/180;const cx=x+24*Math.cos(t),cy=y+24*Math.sin(t),px=-Math.sin(t)*5,py=Math.cos(t)*5;h+=`<circle cx="${cx+px}" cy="${cy+py}" r="2.8" fill="#ffd479"/><circle cx="${cx-px}" cy="${cy-py}" r="2.8" fill="#ffd479"/>`});
   h+=`<g class="at" data-id="${a.id}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="15" fill="${sel==a.id?"#3a6df0":"#0b1018"}" stroke="${sel==a.id?"#8fd3ff":"transparent"}"/><text x="${x}" y="${y+6}" text-anchor="middle" font-size="18" fill="#fff" font-weight="700">${a.el}</text>`+
   (a.fc?`<text x="${x+15}" y="${y-12}" font-size="13" fill="#ff9a8a">${a.fc>0?"+"+(a.fc>1?a.fc:""):"−"+(a.fc<-1?-a.fc:"")}</text>`:"")+"</g>"});
  if(mol.q)h+=`<text x="530" y="30" font-size="16" fill="#ffd479" text-anchor="end">[ ]${mol.q<0?(mol.q<-1?-mol.q:"")+"−":"+"}</text>`;
  svg.innerHTML=h;svg.querySelectorAll(".at").forEach(g=>g.onclick=e=>{e.stopPropagation();sel=+g.dataset.id;draw()});
  svg.querySelectorAll(".bd").forEach(g=>g.onclick=e=>{e.stopPropagation();snap();const b=S.bonds[+g.dataset.i];b.o=b.o%3+1;draw()});svg.onclick=()=>{sel=null;draw()};
  const cnt=formulaCount(mol.f),have={};S.atoms.forEach(a=>have[a.el]=(have[a.el]||0)+1);
  root.querySelector("#pal").innerHTML="Atoms: "+Object.entries(cnt).map(([e,n])=>`<button class="btn sec pe" data-e="${e}">${e} ${have[e]||0}/${n}</button>`).join("");
  root.querySelectorAll(".pe").forEach(b=>b.onclick=()=>addAtom(b.dataset.e));
  const d=drawn(),nd=need();root.querySelector("#vc").innerHTML=`Needed: ${nd} ${mol.q?`(Σ valence ${mol.q<0?"+":"−"} ${Math.abs(mol.q)} for charge)`:""}<br>Placed: <b class="${d==nd?"ok":d>nd?"bad":""}">${d}</b> (bonds ${2*S.bonds.reduce((s,b)=>s+b.o,0)} + lone pairs ${2*S.atoms.reduce((s,a)=>s+a.lp,0)})`;
  const sb=root.querySelector("#selbox"),a=S.atoms.find(x=>x.id==sel);
  sb.innerHTML=a?`<b>Selected ${a.el}</b> (valence ${VAL[a.el]})<br>Lone pairs ${a.lp} <button class="btn sec" id="lpm">−</button><button class="btn sec" id="lpp">+</button><br>Formal charge ${a.fc} <button class="btn sec" id="fcm">−</button><button class="btn sec" id="fcp">+</button>
   <br><button class="btn sec" id="del">Remove atom</button><br><small>Click an element above to bond it to this atom.</small>`:"<small>Select an atom to edit lone pairs and formal charge.</small>";
  if(a){const mod=(k,v)=>{snap();a[k]=Math.max(k=="lp"?0:-3,Math.min(k=="lp"?4:3,a[k]+v));draw()};sb.querySelector("#lpm").onclick=()=>mod("lp",-1);sb.querySelector("#lpp").onclick=()=>mod("lp",1);
   sb.querySelector("#fcm").onclick=()=>mod("fc",-1);sb.querySelector("#fcp").onclick=()=>mod("fc",1);
   sb.querySelector("#del").onclick=()=>{snap();const kill=new Set([a.id]);let ch=true;while(ch){ch=false;S.atoms.forEach(x=>{if(kill.has(x.parent)&&!kill.has(x.id)){kill.add(x.id);ch=true}})}
    S.atoms=S.atoms.filter(x=>!kill.has(x.id));S.bonds=S.bonds.filter(b=>!kill.has(b.a)&&!kill.has(b.b));sel=null;draw()}}}
 const sig=atoms=>atoms.map(a=>a.el+":"+a.nb.sort().join(",")).sort().join("|");
 function check(){const fb=root.querySelector("#lfb"),out=[],bad=m=>out.push(`<p class="bad">✘ ${m}</p>`);root.querySelector("#geoq").innerHTML="";
  const cnt=formulaCount(mol.f),have={};S.atoms.forEach(a=>have[a.el]=(have[a.el]||0)+1);
  if(JSON.stringify(Object.entries(cnt).sort())!=JSON.stringify(Object.entries(have).sort()))return fb.innerHTML=`<p class="bad">✘ Atoms don't match ${mol.f}.</p>`;
  const mine=S.atoms.map(a=>({el:a.el,nb:bondsOf(a.id).map(b=>S.atoms.find(x=>x.id==(b.a==a.id?b.b:b.a)).el)}));
  const ref=mol.sk.map((x,i)=>({el:x[0],nb:mol.sk.filter((y,j)=>j==x[1]||y[1]==i).map(y=>y[0])}));
  if(sig(mine)!=sig(ref))return fb.innerHTML=`<p class="bad">✘ Skeleton: the connectivity is off. Hint: the least electronegative non-H atom goes in the center, and H is always terminal.</p>`;
  const d=drawn(),nd=need();if(d!=nd)bad(`Electron count: placed ${d}, need ${nd}.`);
  S.atoms.forEach(a=>{const e=2*(bsum(a.id)+a.lp),per=BY[a.el].p;
   if(a.el=="H"){if(e!=2)bad(`H has ${e} e⁻ (needs 2).`)}else if(a.el=="B"||a.el=="Be"){if(e>8||(e!=2*VAL[a.el]&&e!=8))bad(`${a.el} has ${e} e⁻.`)}
   else if(per==2){if(e!=8)bad(`${a.el} has ${e} e⁻ — period 2 atoms need exactly 8.`)}else if(e<8)bad(`${a.el} has ${e} e⁻ (needs at least 8).`)});
  const wrong=S.atoms.filter(a=>a.fc!=fcCalc(a));if(wrong.length)bad(`Formal charge wrong on ${wrong.map(a=>a.el).join(", ")}. FC = V − L − ½B.`);
  if(out.length)return fb.innerHTML=out.join("");
  const tot=S.atoms.reduce((s,a)=>s+Math.abs(a.fc),0);let msg=`<p class="ok">✔ Valid Lewis structure. ${mol.note||""}</p>`;
  if(tot>mol.refFC)msg+=`<p class="bad">But it isn't the best one: Σ|FC| = ${tot}, and ${mol.refFC} is possible. Minimize formal charges.</p>`;
  else{const key=S.bonds.map(b=>{const A=S.atoms.find(x=>x.id==b.a),B=S.atoms.find(x=>x.id==b.b);return b.a+"-"+b.b+":"+b.o}).sort().join(";");found.add(key);
   if(mol.res>1)msg+=`<p>Resonance: ${found.size}/${mol.res} equivalent structures found. ${found.size<mol.res?"Move a double bond (and fix the lone pairs and FCs) to draw another, then Check.":"✔ All found. The real ion/molecule is their average, so every bond is equivalent (bond order "+(mol.f=="O3"||mol.f=="NO2−"?"1.5":"1⅓")+")."}</p>`;
   if(mol.res==1||found.size>=mol.res)geoQuiz()}
  fb.innerHTML=msg}
 function geoQuiz(){const G=mol.geo,box=root.querySelector("#geoq");const qs=[["eg","Electron geometry",EG],["mg","Molecular geometry",MG],["ang","Bond angle",ANG]].concat(G.pol?[["pol","Polarity",["polar","nonpolar"]]]:[]);
  box.innerHTML=`<div class="card"><b>VSEPR${G.about?" (around "+G.about+")":""}</b>`+qs.map(([k,l,c])=>`<p>${l}: <select data-k="${k}"><option></option>${c.map(o=>`<option>${o}</option>`).join("")}</select> <span data-r="${k}"></span></p>`).join("")+"</div>";
  box.querySelectorAll("select").forEach(s=>s.onchange=()=>{const k=s.dataset.k,ok=s.value==G[k];box.querySelector(`[data-r=${k}]`).innerHTML=ok?"<span class='ok'>✔</span>":`<span class='bad'>✘ ${G[k]}${k=="pol"?(G.pol=="nonpolar"?": symmetric, so the bond dipoles cancel":": the dipoles don't cancel"):""}</span>`})}
 root.querySelector("#chk").onclick=check;draw()}
