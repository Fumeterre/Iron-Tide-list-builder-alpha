/* Iron Tide — interface hybride : couche de présentation uniquement. */
(()=>{
 const mq=window.matchMedia('(max-width: 700px)');
 let section='formations';
 const labels=['Bataille','Budget','Formations','Conformité','Références','Sauvegarde'];
 const ids=['battle','budget','formations','checks','references','save'];
 function enhance(){
  const main=document.querySelector('#app main');if(!main)return;
  const panels=[...main.children].filter(e=>e.matches('section.panel'));
  panels.forEach((p,i)=>{
   const h=p.querySelector('h2');const t=(h?.textContent||'').toLowerCase();
   let id=t.includes('paramètres')?'battle':t.includes('corps d')?'formations':t.includes('contrôles')?'checks':t.includes('fortification')?'formations':t.includes('sauveg')||t.includes('export')?'save':t.includes('groupe 4')?'references':'references';
   p.dataset.mobileSection=id;
  });
  const stats=main.querySelector('.stats');if(stats){const wrapper=stats.closest('section.panel');if(wrapper && !wrapper.dataset.mobileSection)wrapper.dataset.mobileSection='budget';}
  let nav=document.getElementById('it-mobile-nav');if(!nav){nav=document.createElement('nav');nav.id='it-mobile-nav';nav.setAttribute('aria-label','Navigation mobile du Builder');document.body.appendChild(nav)}
  nav.replaceChildren();
  const available=[...new Set([...main.querySelectorAll('[data-mobile-section]')].map(e=>e.dataset.mobileSection))];
  available.forEach(id=>{const b=document.createElement('button');b.type='button';b.textContent=labels[ids.indexOf(id)]||id;b.dataset.mobileGo=id;b.className=id===section?'selected':'';nav.appendChild(b)});
  if(!available.includes(section))section=available[0]||'formations';
  main.querySelectorAll('[data-mobile-section]').forEach(p=>p.classList.toggle('mobile-hidden',p.dataset.mobileSection!==section));
  nav.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.mobileGo===section));
  let budget=document.getElementById('it-mobile-budget');if(!budget){budget=document.createElement('div');budget.id='it-mobile-budget';document.body.appendChild(budget)}
  const total=typeof state!=='undefined'&&typeof totalCost==='function'?totalCost():null;
  const amount=typeof state!=='undefined'&&state.budget!=null?state.budget:null;
  budget.textContent='';const left=document.createElement('span');left.textContent=total!=null&&amount!=null?`${Math.round(total)} / ${amount} pts`:'Iron Tide · Mon armée';budget.appendChild(left);
  const jump=document.createElement('button');jump.type='button';jump.textContent='Voir les formations';jump.dataset.mobileGo='formations';budget.appendChild(jump);
  document.body.classList.toggle('it-mobile',mq.matches);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-mobile-go]');if(!b)return;section=b.dataset.mobileGo;enhance();window.scrollTo({top:0,behavior:'smooth'})});
 const obs=new MutationObserver(()=>{if(document.querySelector('#app main')){obs.disconnect();enhance();obs.observe(document.getElementById('app'),{childList:true,subtree:false})}});
 obs.observe(document.getElementById('app'),{childList:true,subtree:false});
 mq.addEventListener('change',enhance);
})();
