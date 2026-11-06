/* Iron Tide — calculateur universel, barèmes extraits sans approximation du Budget détaillé (4).
   Le calculateur est distinct des budgets de catalogue V9 : il ne remplace jamais un prix validé silencieusement. */
(()=>{
'use strict';
const R=window.IRON_BUDGET_REFERENCE;
if(!R){console.error('Barèmes officiels absents');return}
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const fmt=n=>n!==null&&n!==undefined&&Number.isFinite(Number(n))?`${Math.round(n*100)/100} pts`:'Indisponible';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mapOptions=(map,chosen)=>Object.keys(map).map(k=>`<option value="${escape(k)}" ${k===String(chosen)?'selected':''}>${escape(k)}</option>`).join('');
const field=(label,key,type='number',step='1')=>`<label>${escape(label)}<input data-calc="${key}" type="${type}" ${type==='number'?`step="${step}"`:''} value="${escape(C[key])}"></label>`;
const select=(label,key,options)=>`<label>${escape(label)}<select data-calc="${key}">${mapOptions(options,C[key])}</select></label>`;
const group=(title,body)=>`<fieldset class="it-calc-fieldset"><legend>${title}</legend><div class="it-calc-grid">${body}</div></fieldset>`;
const optionsMap=a=>Object.fromEntries(a.map(x=>[x,x]));
const types={'inf':'Infanterie','cav':'Cavalerie','support':'Support d’infanterie','armor':'Blindé / véhicule','gun':'Canon / artillerie','air':'Aviation','transport':'Transport','fort':'Fortification'};
const initial=()=>({kind:'armor',name:'Nouvelle référence',nation:'Allemagne',base:0,sourceId:'',front:12,side:11,armorEnabled:true,category:'Char moyen',size:'Normal',traction:'Chenillé',speed:'Normal',mainWeapon:'Canon',d6:0,d8:0,d10:0,ac:5,weaponCount:1,capacity:1,firecracker:'Aucun',period:'Effective',exp:'Vétéran',morale:'Vaillant',osc:false,fan:false,ammo:'',ammoMode:'constant',extraAmmo:0,artilleryMode:'Aucune',airMode:'Un avion',traits:[],baseIncluded:false,manualBase:0});
let C=initial();
const vehicleSections={category:{'Char léger':0.8,'Char moyen':1,'Chasseur de char':1,'Canon automoteur':1,'Char Lourd':1.15,'Canon porté':0.75},size:Object.fromEntries(['Très petit','Petit','Normal','Grand','Très Grand','Mastodonte'].map(x=>[x,R.vehicle[x]])),traction:Object.fromEntries(['Hippomobile','Roue','Semi-chenillé','Chenillé'].map(x=>[x,R.vehicle[x]])),speed:{'Très lent':-10,'Lent':-5,'Normal':0,'Rapide':5,'Très rapide':10},mainWeapon:Object.fromEntries(['MG','Canon','Obusier/Roquette/Mortier','Lance flamme'].map(x=>[x,R.vehicle[x]]))};
const extraTraits=()=>C.kind==='inf'?R.infTraits:C.kind==='cav'?R.cavTraits:C.kind==='gun'?R.gunTraits:C.kind==='air'?Object.fromEntries(Object.entries(R.aviation).filter(([k])=>['Vulnérable','Full MMG','Résistant','Duelliste','Reconnaissance aérienne','Combat nuit','Jet'].includes(k))):R.vehicleTraits;
const uniqueTraits=()=>Object.entries(extraTraits()).filter(([k,v])=>Number.isFinite(v)&&!['Casemate ouverte'].includes(k)||k==='Casemate ouverte').filter(([k],i,arr)=>arr.findIndex(([j])=>j===k)===i);
function compute(){
 const parts=[],warn=[];
 const invalid=[];
 const requireValue=(condition,message)=>{if(!condition){invalid.push(message);warn.push(message)}};
 requireValue(Object.hasOwn(R.period,C.period),'Période non reconnue dans le Budget détaillé');
 requireValue(Object.hasOwn(R.experience,C.exp),'Expérience non reconnue dans le Budget détaillé');
 requireValue(Object.hasOwn(R.morale,C.morale),'Moral non reconnu dans le Budget détaillé');
 if(C.kind==='armor'||C.kind==='transport'){requireValue(!C.armorEnabled||(Object.hasOwn(R.armor,String(C.front))&&Object.hasOwn(R.armor,String(C.side))),'Blindage hors barème officiel');}
 if(['armor','transport','gun','air'].includes(C.kind)&&C.mainWeapon!=='MG')requireValue(Object.hasOwn(R.ac,String(C.ac)),'AC absent du barème officiel');
 const add=(label,n)=>{if(!Number.isFinite(n)){warn.push(`Barème manquant : ${label}`);invalid.push(`Barème manquant : ${label}`);return}parts.push({label,amount:n})};
 let price=0;
 const dice=num(C.d6)*3+num(C.d8)*5+num(C.d10)*8;
 const ac=R.ac[String(C.ac)];
 const priceArmor=()=>{const f=R.armor[String(C.front)],l=R.armor[String(C.side)];if(!f||!l){warn.push('Indices de blindage hors barème (9 à 20)');invalid.push('Blindage hors barème');return}add('Blindage frontal + latéral et primes',f.front+l.side+num(f.frontBonus)+num(l.sideBonus))};
 if(C.kind==='inf'||C.kind==='cav'){
  const t=C.kind==='inf'?R.inf:R.cav;
  if(!Object.hasOwn(t,C.baseCategory)){invalid.push('Catégorie d’infanterie/cavalerie inconnue');warn.push('Catégorie inconnue')}else add('Catégorie d’unité (armement organique inclus)',t[C.baseCategory]);
  if(C.command)add('Supplément commandement',num(t.Commandement));
 }else if(C.kind==='support'){
  if(typeof R.support[C.supportType]==='number')add('Support (servants compris)',R.support[C.supportType]);
  else {warn.push('Ce support possède une formule spécifique non chiffrée : vérifier le Budget détaillé');invalid.push('Support non chiffrable avec les paramètres actuels')}
 }else if(C.kind==='armor'||C.kind==='transport'){
  if(C.armorEnabled)priceArmor();else add('Véhicule non blindé',R.vehicle['Véhicule non blindé']);
  add('Taille',vehicleSections.size[C.size]);add('Traction',vehicleSections.traction[C.traction]);add('Vitesse',vehicleSections.speed[C.speed]);
  add('Armement principal',vehicleSections.mainWeapon[C.mainWeapon]);
  if(C.mainWeapon!=='MG'){add('Puissance de feu séparée',dice);add('Capacité antichar',ac)}
  if(C.kind==='transport')add('Capacité transport',R.transport[String(C.capacity)]);
  if(C.kind==='armor')add('Firecracker',R.firecracker[C.firecracker]);
 }else if(C.kind==='gun'){
  add('Puissance de feu séparée',dice);add('Capacité antichar',ac);
  if(C.gunBase)add('Coût de montage / châssis déclaré',num(C.manualBase));
 }else if(C.kind==='air'){
  add('Puissance de feu',dice);add('Capacité antichar',ac);
  add('Base avion',num(R.aviation['Base avions']));
  add('Munitions supplémentaires',Math.max(0,num(C.extraAmmo))*num(R.aviation['/ munitions supplémentaire']));
 }else if(C.kind==='fort'){
  add('Coût de fortification saisi (barème non universalisé)',num(C.manualBase));
  warn.push('Fortification : tarif manuel, à vérifier selon Doctrine');invalid.push('Fortification non calculée automatiquement')
 }
 const traitMap=extraTraits();
 for(const name of C.traits){if(typeof traitMap[name]==='number')add(`Trait / équipement : ${name}`,traitMap[name]);else {warn.push(`Trait sans tarif numérique : ${name}`);invalid.push(`Trait non tarifé : ${name}`)}}
 if(C.ammo&&C.kind!=='inf'&&C.kind!=='cav'&&C.kind!=='fort'){
  const a=R.munitions[C.ammo];if(a){add(`Munition ${C.ammo} (${C.ammoMode})`,num(a[C.ammoMode]));}else {warn.push('Munition absente du barème');invalid.push('Munition non tarifée')}
 }
 let subtotal=parts.reduce((s,x)=>s+x.amount,0);
 if(C.kind==='armor'||C.kind==='transport'){
  const mult=vehicleSections.category[C.category];
  if(C.kind==='armor'){
   if(!Number.isFinite(mult)){invalid.push('Catégorie de véhicule inconnue');warn.push('Catégorie de véhicule inconnue')}
   const after=Math.ceil(subtotal*(Number.isFinite(mult)?mult:1));add(`Indice véhicule (${mult} ×, arrondi supérieur)`,after-subtotal);subtotal=after;
  }
 }
 if(C.kind==='air'){
  const q={'Un avion':1,'Limité':1,'Normal':2,'Prioritaire':3}[C.airMode]||1;
  if(q!==1)add(`Appareils supplémentaires (${q} au total)`,subtotal*(q-1));
 }
 if(C.kind==='gun'&&C.artilleryMode!=='Aucune'){
  const q=C.artilleryMode==='Demi-batterie'?3:6;
  add(`Batterie hors table : ${q} pièces au total`,subtotal*(q-1));
  warn.push('Batterie hors table : ajouter séparément taille, vitesse et options propres à la batterie si applicables');
 }
 subtotal=parts.reduce((s,x)=>s+x.amount,0);
 const beforePeriod=subtotal;
 const periodFactor=R.period[C.period]??1;
 if(periodFactor!==1)add(`Période (${periodFactor}×)`,subtotal*periodFactor-subtotal);
 subtotal=parts.reduce((s,x)=>s+x.amount,0);
 const exp=R.experience[C.exp];
 if(exp){const tier=subtotal<=100?0:subtotal<=200?1:2;add(`Expérience ${C.exp} (tranche ${tier+1})`,num(exp[tier]));}
 add(`Moral ${C.morale}`,num(R.morale[C.morale]));
 if(C.osc)add('Oscillant',num(R.morale.Oscillant));
 if(C.fan)add('Fanatique',num(R.morale.Fanatique));
 const total=parts.reduce((s,x)=>s+x.amount,0);
 if(C.kind==='armor'&&C.sourceId)warn.push('Véhicule existant : comparaison indicative uniquement, le blindage de la référence ne doit pas être modifié');
 if(total<0){warn.push('Coût négatif : vérifier les entrées et les coefficients');invalid.push('Coût négatif')}
 return {parts,warn,total:invalid.length?null:Math.ceil(total),beforePeriod,valid:invalid.length===0,blocking:invalid};
}
function calcHTML(){
 if(!C.baseCategory)C.baseCategory='Ligne';if(!C.supportType)C.supportType='MMG';
 const result=compute();
 const isVehicle=['armor','transport'].includes(C.kind),isInf=['inf','cav'].includes(C.kind),isWeapon=['armor','transport','gun','air'].includes(C.kind);
 
 const sourceList=DB.filter(x=>x.nation===C.nation&&(['armor','transport','gun','air'].includes(x.kind))).slice(0,1000);
 const refPrice=C.sourceId?item(C.sourceId)?.costs?.[state.period]:null;
 const sourceRecord=C.sourceId?item(C.sourceId):null;
 const refStatus=sourceRecord?.priceStatus||'non_documenté';
 return `<section class="panel it-calculator"><h2>Calculateur universel — Budget détaillé</h2><p>Calcul paramétrique distinct de la bibliothèque officielle. Tous les barèmes chiffrés proviennent du classeur « ${escape(R.source)} ». Les références existantes ne sont jamais réécrites automatiquement.</p>
 ${group('Identification',select('Type d’unité','kind',types)+field('Nom de la référence','name','text')+select('Nation','nation',{'Allemagne':1,'URSS':1})+`<label>Comparer avec une référence OdB<select data-calc="sourceId"><option value="">Aucune</option>${sourceList.map(x=>`<option value="${escape(x.id)}" ${x.id===C.sourceId?'selected':''}>${escape(x.name)}</option>`).join('')}</select></label>`)}
 ${isInf?group('Infanterie / cavalerie',select('Catégorie','baseCategory',C.kind==='inf'?R.inf:R.cav)+`<label class="check"><input type="checkbox" data-calc="command" ${C.command?'checked':''}> Commandement (+ coût spécifique)</label>`):''}
 ${C.kind==='support'?group('Armes de support',select('Type de support','supportType',R.support)):''}
 ${isVehicle?group('Véhicule',select('Catégorie / multiplicateur','category',vehicleSections.category)+`<label class="check"><input type="checkbox" data-calc="armorEnabled" ${C.armorEnabled?'checked':''}> Véhicule blindé</label>`+(C.armorEnabled?select('Indice frontal','front',R.armor)+select('Indice latéral','side',R.armor):'')+select('Taille','size',vehicleSections.size)+select('Traction','traction',vehicleSections.traction)+select('Vitesse','speed',vehicleSections.speed)+select('Armement principal','mainWeapon',vehicleSections.mainWeapon)+(C.kind==='transport'?select('Capacité de transport','capacity',R.transport):select('Firecracker','firecracker',R.firecracker))):''}
 ${isWeapon&&(C.kind==='gun'||C.kind==='air'||C.mainWeapon!=='MG')?group('Armement et puissance de feu',field('Nombre de D6','d6')+field('Nombre de D8','d8')+field('Nombre de D10','d10')+select('AC','ac',R.ac)+(C.kind==='gun'?select('Artillerie hors table','artilleryMode',{'Aucune':1,'Demi-batterie':3,'Batterie complète':6})+`<label class="check"><input type="checkbox" data-calc="gunBase" ${C.gunBase?'checked':''}> Ajouter montage / châssis</label>`+(C.gunBase?field('Coût montage / châssis','manualBase'):''):'')+(C.kind==='air'?field('Munitions supplémentaires','extraAmmo')+select('Support aérien','airMode',{'Un avion':1,'Limité':1,'Normal':2,'Prioritaire':3}):'')):''}
 ${C.kind==='fort'?group('Fortification',field('Tarif selon la doctrine','manualBase')):''}
 ${isWeapon?group('Munitions',select('Munition','ammo',{'':'Aucune',...Object.fromEntries(Object.keys(R.munitions).map(k=>[k,1]))})+select('Dotation','ammoMode',{'constant':0,'optional':1})):''}
 ${group('Période, expérience et moral',select('Période','period',R.period)+select('Expérience','exp',Object.fromEntries(Object.keys(R.experience).filter(k=>!isInf||k!=='As').map(k=>[k,1])))+select('Moral','morale',R.morale)+`<label class="check"><input type="checkbox" data-calc="osc" ${C.osc?'checked':''}> Oscillant</label><label class="check"><input type="checkbox" data-calc="fan" ${C.fan?'checked':''}> Fanatique</label>`)}
 <fieldset class="it-calc-fieldset"><legend>Traits et équipements (hors armement standard)</legend><div class="it-calc-traits">${uniqueTraits().map(([name,value])=>`<label class="check"><input type="checkbox" data-calc-trait="${escape(name)}" ${C.traits.includes(name)?'checked':''}> ${escape(name)} (${value>0?'+':''}${value})</label>`).join('')}</div></fieldset>
 ${sourceRecord?`<p class="muted"><strong>Statut tarif OdB :</strong> ${escape(refStatus)}. Une comparaison ne valide pas le calcul.</p>`:''}
 <div class="it-calc-result"><div><small>Prix calculé</small><strong>${fmt(result.total)}</strong></div><div><small>Prix OdB (${escape(state.period)})</small><strong>${fmt(refPrice)}</strong></div><div><small>Écart calcul / OdB</small><strong>${refPrice==null||!result.valid?'Non comparable':fmt(result.total-refPrice)}</strong></div></div>
 <details open><summary>Décomposition du calcul (${result.parts.length} lignes)</summary><table class="it-calc-table"><tbody>${result.parts.map(p=>`<tr><td>${escape(p.label)}</td><td>${p.amount>=0?'+':''}${Math.round(p.amount*100)/100}</td></tr>`).join('')}</tbody><tfoot><tr><th>Total arrondi</th><th>${fmt(result.total)}</th></tr></tfoot></table></details>
 ${result.warn.length?`<div class="it-calc-warnings"><strong>Vérifications nécessaires</strong><ul>${result.warn.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></div>`:''}
 <div class="toolbar"><button type="button" data-calcclick="save" ${!result.valid?'disabled title="Calcul incomplet"':''}>Créer une copie personnelle</button><button type="button" data-calcclick="export">Exporter la simulation JSON</button><button type="button" data-calcclick="reset">Réinitialiser</button></div>
 <p class="muted">Le calculateur n’altère pas les blindages des références OdB. Une copie personnelle ne remplace pas un budget officiel. Les tarifs non numériques ou ambigus sont signalés, jamais inventés.</p>
 <h3>Références personnalisées (${state.custom.length})</h3>${state.custom.map(x=>`<div class="line unit"><span>${escape(x.name)} — ${fmt(x.costs?.[state.period])}</span><button class="small danger" data-action="deleteCustom" data-id="${escape(x.id)}">Supprimer</button></div>`).join('')}</section>`;
}
const originalRender=render;
render=function(){originalRender();if(view==='workshop'){const main=document.querySelector('#app main');if(main)main.innerHTML=calcHTML();}};
const saveCustom=()=>{
 const r=compute();if(!r.valid){alert('Calcul incomplet : impossible d’enregistrer un prix non fiable. '+r.blocking.join('; '));return}
 if(r.warn.length&&!confirm('Des points nécessitent une vérification. Enregistrer tout de même une copie personnelle non officielle ?'))return;
 const orig=C.sourceId?item(C.sourceId):null;
 const kind=orig?.kind||({armor:'armor',gun:'gun',air:'air',transport:'transport',inf:'inf',cav:'cav',support:'support',fort:'fort'}[C.kind]);
 const x={...(orig||{}),id:'custom-'+id(),name:C.name.trim()||'Nouvelle unité',nation:C.nation,kind,type:orig?.type||C.kind,rarity:orig?.rarity||0,costs:{Early:r.total,Mid:r.total,Late:r.total},priceStatus:'simulation_personnelle_non_officielle',budgetVerification:{status:'provisoire',allowInLists:true,reconciled:false,authority:R.source},custom:true,source:'Calculateur universel — copie personnelle',calculator:{inputs:structuredClone(C),result:r,source:R.source},sourceRow:0};
 state.custom.push(x);alert('Copie personnelle créée. Coût enregistré fixe : '+fmt(r.total)+' (ne remplace aucun tarif officiel).');render();
};
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.hasAttribute('data-calc')){
  const k=el.getAttribute('data-calc');
  C[k]=el.type==='checkbox'?el.checked:el.type==='number'?num(el.value):el.value;
  if(k==='kind'){C.traits=[];C.sourceId=''}
  if(k==='nation')C.sourceId='';
  if(k==='sourceId'&&C.sourceId){const x=item(C.sourceId);if(x)C.name=x.name+' (copie)'}
  render();e.stopImmediatePropagation();
 }else if(el.hasAttribute('data-calc-trait')){
  const k=el.getAttribute('data-calc-trait');C.traits=el.checked?[...new Set([...C.traits,k])]:C.traits.filter(x=>x!==k);render();e.stopImmediatePropagation();
 }
},true);
document.addEventListener('click',e=>{
 const el=e.target.closest('[data-calcclick]');if(!el)return;
 e.stopImmediatePropagation();const action=el.dataset.calcclick;
 if(action==='reset'){C=initial();render()}
 else if(action==='save')saveCustom();
 else if(action==='export'){const r=compute();download('Iron_Tide_simulation_budget.json',JSON.stringify({source:R.source,inputs:C,result:r},null,2),'application/json')}
},true);
window.IronTideUniversalCalculator={calculate:inputs=>{const prev=C;try{C={...initial(),...inputs};return compute()}finally{C=prev}},reference:R, auditCatalogue:()=>DB.map(x=>({id:x.id,nom:x.name,nation:x.nation,statut:x.priceStatus||'non_documenté',Early:x.costs?.Early??null,Mid:x.costs?.Mid??null,Late:x.costs?.Late??null}))};
render();
})();
