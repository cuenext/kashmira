const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(base);
  const choices=page.locator('[data-buddy]');
  assert.equal(await choices.count(),3,'Children can choose one of three smile buddies');
  for(const name of ['rainbow','rocket','tooth-friend']){
   const button=page.locator(`[data-buddy="${name}"]`);
   await button.focus();await page.keyboard.press('Enter');
   assert.equal(await button.getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[data-buddy][aria-pressed=true]').count(),1);
   assert.match(new URL(await page.locator('#visit-buddy').getAttribute('src'),base).pathname,new RegExp(name+'\\.svg$'));
   assert.ok((await page.locator('#buddy-status').textContent()).length>15,'The selection has readable feedback');
  }
  await page.getByRole('button',{name:'Pause animations',exact:true}).click();
  await page.locator('[data-buddy="rainbow"]').click();
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'A paused selection does not animate');
  await page.setViewportSize({width:320,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.ok(await page.locator('.buddy-picker').isVisible());
  const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const quiet=await reduced.newPage();await quiet.goto(base);await quiet.locator('[data-buddy="rocket"]').click();
  assert.equal(await quiet.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
  await reduced.close();
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();await staticPage.goto(base);
  assert.equal(await staticPage.locator('.buddy-picker').isVisible(),false,'Inactive controls stay hidden without JavaScript');
  assert.equal(await staticPage.locator('#visit-buddy').isVisible(),true,'The default illustration remains visible');
  await nojs.close();
  console.log('PASS smile-buddy selection, keyboard feedback, mobile fit, global pause, reduced motion and no-JS artwork');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
