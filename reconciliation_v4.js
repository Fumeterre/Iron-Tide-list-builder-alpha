/* V4 — statut de provenance, aucune modification de prix officiel */
(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const previous=itEnhance;
itEnhance=function(){previous();if(view!=='army')return;
 const main=document.querySelector('#app main');if(!main)return;
 const selected=[];for(const c of state.corps)for(const f of c.formations){
  for(const m of f.models||[]){const x=item(m.catalogId);if(x?.budgetVerification?.status==='provisoire')selected.push({name:x.name,period:state.period,price:x.costs?.[state.period]});}
  for(const s of f.sections||[])for(const u of s.units||[]){const x=item(u.transportId);if(x?.budgetVerification?.status==='provisoire')selected.push({name:x.name,period:state.period,price:x.costs?.[state.period]});}
  for(const u of [f.hq,...(f.reserveUnits||[]),...(f.units||[])]){const x=item(u?.transportId);if(x?.budgetVerification?.status==='provisoire')selected.push({name:x.name,period:state.period,price:x.costs?.[state.period]});}
 }
 let old=document.querySelector('#it-v4-provisional');old?.remove();
 const panel=document.createElement('section');panel.id='it-v4-provisional';panel.className='panel';
 panel.innerHTML='<h2>Transparence des tarifs</h2><p>Les tarifs provisoires restent utilisables et inclus dans les totaux. Ils ne sont pas certifiés par le Budget détaillé (4). Aucun prix officiel n’est remplacé.</p>'+(selected.length?'<p class="warning">⚠ '+selected.length+' unité(s) sélectionnée(s) avec tarif provisoire.</p><details><summary>Voir les références</summary><ul>'+selected.map(x=>'<li>'+esc(x.name)+' — '+esc(x.period)+' : '+(Number.isFinite(x.price)?x.price+' pts':'prix indisponible')+' (provisoire)</li>').join('')+'</ul></details>':'<p class="good">Aucune référence provisoire sélectionnée dans les unités inspectées.</p>');
 main.insertAdjacentElement('afterbegin',panel);
};
window.IronTideBudgetV4={summary:()=>({catalogue:DB.length,provisoires:DB.filter(x=>x.budgetVerification?.status==='provisoire').length}),audit:()=>DB.map(x=>({id:x.id,nom:x.name,statut:x.budgetVerification?.status,prix:x.costs}))};
render();
})();
