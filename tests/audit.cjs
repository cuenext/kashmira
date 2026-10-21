const { chromium }=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
const practices=[
 {name:'Dr. Munir Silwadi Dental Centre',street:'Al Raha Mall',city:'Abu Dhabi'},
 {name:'Dr. Sai Ganesh Medical Centre',street:'Al Karama',city:'Dubai'},
 {name:'Bay Avenue Dental Centre',street:'Business Bay',city:'Dubai'},
 {name:'Hellenic Dental Clinic',street:'Al Wasl Road, Al Bada’a',city:'Dubai'}
];

async function currentLocations(page,context){
 const cards=page.locator('#locations .location-list article');
 assert.equal(await cards.count(),4,context+' lists exactly four current clinic locations');
 for(const practice of practices){
  const card=cards.filter({hasText:practice.name});
  assert.equal(await card.count(),1,context+' identifies '+practice.name+' once');
  assert.equal(await card.isVisible(),true,context+' keeps '+practice.name+' accessible');
  const text=await card.innerText();
  assert.ok(text.includes(practice.street),context+' shows the verified street or area for '+practice.name);
  assert.ok(text.includes(practice.city),context+' shows the correct city for '+practice.name);
 }
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 const context=await browser.newContext();
 const page=await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const broken=[];page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)broken.push([r.status(),r.url()]);});
 const results=[];
  // The catalog has many anchors pointing into the same HTML document and
  // duplicate cover/thumbnail destinations. Validate each URL with one request.
  const internalTargets=new Map();
 for(const file of ['index.html','about.html','contact.html','cases.html']){
  await page.goto(base+file);await page.evaluate(()=>document.fonts.ready);
  // Visit each rendered image so browser lazy loading has a real viewport trigger.
  // Decode completion is the signal, rather than a short arbitrary scroll delay.
  for(const image of await page.locator('img:visible').all()){
   await image.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
   await image.evaluate(async el=>{await new Promise(resolve=>requestAnimationFrame(resolve));await el.decode()});
  }
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(900);
  // Inactive case panels and the closed viewer intentionally defer their images.
  // The case-gallery checks open every panel/photo and verify those separately.
  const failures=await page.locator('img').evaluateAll(images=>images.filter(i=>i.getClientRects().length&&(!i.complete||!i.naturalWidth)).map(i=>i.currentSrc));
  assert.deepEqual(failures,[],file+' images must load');
  const ld=await page.locator('script[type="application/ld+json"]').textContent();
  const graph=JSON.parse(ld)['@graph'];
  const doctor=graph.find(g=>g['@type']==='Person'&&g.name==='Dr. Kashmira Pawar');
  assert.ok(doctor);
  assert.ok(Array.isArray(doctor.worksFor),file+' schema represents multiple current practices');
  assert.deepEqual(doctor.worksFor.map(practice=>practice.name).sort(),practices.map(practice=>practice.name).sort(),file+' schema names exactly the four confirmed current clinics');
  for(const practice of practices){
   const workplace=doctor.worksFor.find(item=>item.name===practice.name);
   assert.equal(workplace['@type'],'Dentist',file+' identifies each workplace as a dental practice');
   assert.equal(workplace.address?.['@type'],'PostalAddress',file+' provides structured practice addresses');
   assert.equal(typeof workplace.address.streetAddress,'string',file+' provides a street or area for '+practice.name);
   assert.ok(workplace.address.streetAddress.includes(practice.street),file+' schema shows the verified area for '+practice.name);
   assert.equal(workplace.address.addressLocality,practice.city,file+' schema assigns the correct city for '+practice.name);
   assert.equal(workplace.address.addressCountry,'AE',file+' schema assigns the correct country');
  }
  assert.match(doctor.description||'',/Abu Dhabi/i,file+' doctor schema describes current Abu Dhabi practice');
  assert.match(doctor.description||'',/Dubai/i,file+' doctor schema describes current Dubai practice');
  const bodyText=await page.locator('body').innerText();
  assert.match(bodyText,/Abu Dhabi/i,file+' communicates current Abu Dhabi geography');
  assert.match(bodyText,/Dubai/i,file+' communicates current Dubai geography');
  if(file==='about.html'){
   const current=(await page.locator('#experience .current-practice').allInnerTexts()).map(text=>text.replace(/\s+/g,' ').trim());
   for(const practice of practices)assert.ok(current.some(text=>text.includes(practice.name)),practice.name+' appears in About current practice information');
   const history=await page.locator('#experience .career-history').innerText();
   for(const practice of practices)assert.equal(history.includes(practice.name),false,'A current clinic must not be labelled previous experience');
   assert.match(history,/Family Dental Clinic/i,'About retains the genuinely previous Dubai role');
   assert.match(history,/Clove Dental/i,'About retains the India work history');
   assert.match(history,/Dr\. Patil/i,'About retains the earlier India clinical practice');
  }
  const footer=await page.locator('footer').innerText();
  assert.match(footer,/Abu Dhabi/i,file+' footer includes Abu Dhabi');
  assert.match(footer,/Dubai/i,file+' footer includes Dubai');
  const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.equal(canonical,'https://cuenext.github.io/kashmira/'+(file==='index.html'?'':file));
  assert.equal(await page.locator('script[src]').count(),1,'Shared JS must initialize only once');
  const links=await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
  for(const link of links.filter(l=>!/^https?:|^mailto:|^tel:/.test(l))){
   const u=new URL(link,base+file);
   const target=u.href.split('#')[0];
   if(!internalTargets.has(target))internalTargets.set(target,context.request.get(target));
   const response=await internalTargets.get(target);
   assert.ok(response.ok(),file+' broken internal target '+link);
   if(u.hash){const text=await response.text();assert.ok(text.includes('id="'+u.hash.slice(1)+'"'),file+' missing fragment '+link)}
  }
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   await page.waitForTimeout(1100);
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   results.push({file,width,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>n.target)}))});
   assert.deepEqual(axe.violations.map(v=>v.id),[],file+' accessibility at '+width+': '+JSON.stringify(results.at(-1)));
  }
 }
 await page.goto(base+'contact.html');
 assert.equal(await page.locator('#booking-form select#booking-location').count(),1,'Parents can choose a current clinic when making an inquiry');
 await currentLocations(page,'Contact');
 await page.goto(base+'index.html');
 const firstFaq=page.locator('.faq-list details').first();
 await firstFaq.locator('summary').focus();await page.keyboard.press('Enter');
 assert.equal(await firstFaq.getAttribute('open'),'','FAQ must open by keyboard');
 await page.setViewportSize({width:390,height:844});
 await page.locator('.menu-toggle').click();
 await page.setViewportSize({width:1024,height:900});
 await page.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false');
 assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false','Resize resets menu');
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.ok(await page.locator('[data-reveal]').evaluateAll(els=>els.every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).animationName==='none')),'Reduced motion must expose all content');
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const staticPage=await nojs.newPage();await staticPage.goto(base+'contact.html');
 assert.equal(await staticPage.getByRole('navigation').isVisible(),true,'Mobile navigation works without JavaScript');
 assert.equal(await staticPage.getByRole('link',{name:'Open WhatsApp to ask about an appointment ↗'}).isVisible(),true,'No-JS booking fallback');
 assert.equal(await staticPage.locator('#booking-form button').isVisible(),false,'No-JS form must not submit personal data to server');
 assert.equal(await staticPage.locator('#booking-form [name]').count(),0,'No-JS booking controls cannot leak details through default form submission');
 assert.equal(await staticPage.locator('#booking-form select#booking-location').count(),1,'The native clinic choice remains in the document without JavaScript');
 await currentLocations(staticPage,'No-JS Contact');
 assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);
 fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/accessibility.json',JSON.stringify(results,null,2));
 await browser.close();console.log('PASS images, internal links/fragments, four current clinics and two-city body/schema, keyboard FAQ, clinic booking, menu resize, reduced motion, no-JS, and 8 WCAG A/AA scans');
})().catch(e=>{console.error(e);process.exit(1)});
