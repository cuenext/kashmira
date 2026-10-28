const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await page.goto(base);
  assert.equal(await page.locator('#star-mission').count(),0,'Obsolete game removed');
  assert.equal(await page.locator('.rocket-launch').count(),0,'Unexplained launch action removed');
  assert.equal(await page.getByRole('button',{name:'Pause animations',exact:true}).count(),1,'Decorative motion retains accessible pause');
  await page.waitForFunction(()=>document.querySelector('.hero-cloud')?.classList.contains('motion-visible'));
  assert.equal(await page.locator('.hero-cloud').evaluate(el=>getComputedStyle(el).animationPlayState),'running','A visible cloud floats');
  await page.getByRole('button',{name:'Pause animations',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'Pause stops running animations');
  for(const file of ['about.html','contact.html','cases.html']){
   await page.goto(base+file);
   assert.equal(await page.getByRole('button',{name:'Resume animations',exact:true}).getAttribute('aria-pressed'),'true','Pause preference survives navigation to '+file);
   assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'Paused animations remain stopped on '+file);
  }
  await page.getByRole('button',{name:'Resume animations',exact:true}).click();
  await page.goto(base);
  const details=page.locator('.care-item').first();
  await details.locator('summary').click();
  await page.waitForFunction(()=>!document.querySelector('.care-item').open);
  await details.locator('summary').click();
  await page.waitForFunction(()=>document.querySelector('.care-item').open&&!document.querySelector('.care-item').dataset.animating);
  assert.equal(await details.evaluate(el=>el.style.height),'','Accordion releases height after opening');
  const reduce=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const quiet=await reduce.newPage();await quiet.goto(base);
  assert.equal(await quiet.locator('.motion-toggle').isVisible(),false,'No switch is needed for system reduced motion');
  assert.equal(await quiet.locator('#star-mission').count(),0);
  assert.equal(await quiet.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'Reduced motion disables continuous effects');
  console.log('PASS decorative motion pause, persistence, accordion and reduced-motion alternatives');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
