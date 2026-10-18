const { chromium }=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 const context=await browser.newContext();
 const page=await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const broken=[];page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)broken.push([r.status(),r.url()]);});
 const results=[];
 for(const file of ['index.html','about.html','contact.html']){
  await page.goto(base+file);await page.evaluate(()=>document.fonts.ready);
  // Lazy imagery is loaded by actually walking the page, not disabling loading.
  await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,90))}scrollTo({top:0,behavior:'instant'})});
  await page.waitForTimeout(900);
  const failures=await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.currentSrc));
  assert.deepEqual(failures,[],file+' images must load');
  const ld=await page.locator('script[type="application/ld+json"]').textContent();
  const graph=JSON.parse(ld)['@graph'];
  assert.ok(graph.find(g=>g['@type']==='Person'&&g.name==='Dr. Kashmira Pawar'));
  const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.equal(canonical,'https://cuenext.github.io/kashmira/'+(file==='index.html'?'':file));
  assert.equal(await page.locator('script[src]').count(),1,'Shared JS must initialize only once');
  const links=await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
  for(const link of links.filter(l=>!/^https?:|^mailto:|^tel:/.test(l))){
   const u=new URL(link,base+file);
   const response=await context.request.get(u.href.split('#')[0]);
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
 await page.locator('#booking-form button').click();
 assert.equal(await page.locator('#booking-location').evaluate(el=>el.validity.valueMissing),true,'Location is required');
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
 assert.deepEqual(errors,[]);assert.deepEqual(broken,[]);
 fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/accessibility.json',JSON.stringify(results,null,2));
 await browser.close();console.log('PASS images, internal links/fragments, schema, keyboard FAQ, required field, menu resize, reduced motion, no-JS, and 6 WCAG A/AA scans');
})().catch(e=>{console.error(e);process.exit(1)});
