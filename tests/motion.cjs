const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 await page.goto(base);
 assert.equal(await page.getByRole('button',{name:'Pause animations',exact:true}).count(),1,'Continuous motion needs a visible pause control');
 await page.waitForFunction(()=>document.querySelector('.hero-cloud').classList.contains('motion-visible'));
 assert.equal(await page.locator('.hero-cloud').evaluate(el=>getComputedStyle(el).animationPlayState),'running','A visible cloud must actually float');
 const smile=page.getByRole('button',{name:'Send a smile',exact:true});
 await smile.click();
 assert.match(await page.locator('#smile-status').textContent(),/smile/i);
 assert.ok(await page.locator('.smile-particle').count()>0,'A requested smile should animate');
 await page.getByRole('button',{name:'Pause animations',exact:true}).click();
 assert.equal(await page.locator('.smile-particle').count(),0,'Pause clears active particles');
 assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'Pause stops all active animation');
 for(const file of ['about.html','contact.html','cases.html']){
  await page.goto(base+file);
  assert.equal(await page.getByRole('button',{name:'Resume animations',exact:true}).getAttribute('aria-pressed'),'true','Pause preference survives navigation to '+file);
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'Paused animations stay stopped on '+file);
 }
 await page.getByRole('button',{name:'Resume animations',exact:true}).click();
 await page.goto(base);
 const details=page.locator('.care-item').first();
 await details.locator('summary').click();
 await page.waitForFunction(()=>!document.querySelector('.care-item').open);
 await details.locator('summary').click();
 await page.waitForFunction(()=>document.querySelector('.care-item').open&&!document.querySelector('.care-item').dataset.animating);
 assert.equal(await details.evaluate(el=>el.style.height),'','Accordion releases its height after opening');
 const reduce=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
 const staticPage=await reduce.newPage();await staticPage.goto(base);
 assert.equal(await staticPage.locator('.motion-toggle').isVisible(),false,'System reduced motion should need no extra switch');
 await staticPage.getByRole('button',{name:'Send a smile',exact:true}).click();
 assert.match(await staticPage.locator('#smile-status').textContent(),/smile/i);
 assert.equal(await staticPage.locator('.smile-particle').count(),0);
 assert.equal(await staticPage.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
 await browser.close();console.log('PASS smile interaction, global pause, navigation persistence, accordion motion and reduced-motion alternatives');
})().catch(e=>{console.error(e);process.exit(1)});
