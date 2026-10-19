const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 const axeResults=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);
  const mission=page.locator('#star-mission');
  assert.equal(await mission.count(),1,'A child can find a playable star mission');
  const board=mission.locator('#space-game-board');
  const start=mission.locator('[data-game-start]');
  const reset=mission.locator('[data-game-reset]');
  const stars=mission.locator('button[data-game-star]');
  const score=mission.locator('#mission-score');
  const status=mission.locator('#mission-status');
  const rocket=mission.locator('#mission-rocket');
  assert.equal(await stars.count(),6,'The mission has six reachable stars');
  assert.equal(await status.getAttribute('role'),'status','Game updates are announced without moving focus');
  assert.match(await score.textContent(),/0\s*\/\s*6/);
  assert.equal(await reset.isVisible(),false,'Replay appears after a completed mission');
  for(const star of await stars.all())assert.ok(!(await star.isVisible())||await star.isDisabled(),'Stars cannot be collected before starting');

  // A missing visibility observer would leave decorative motion running offscreen.
  for(const selector of ['.space-planet','.space-cruiser']){
   const decoration=page.locator(selector).first();
   assert.ok(await decoration.count(),'Space decorations include '+selector);
   await decoration.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
   await page.waitForFunction(selector=>{
    const element=document.querySelector(selector);
    return element&&element.getAnimations().some(animation=>animation.playState==='running');
   },selector);
   await mission.scrollIntoViewIfNeeded();
   await page.waitForFunction(selector=>{
    const element=document.querySelector(selector);
    const box=element.getBoundingClientRect();
    return box.bottom>0&&box.top<innerHeight||element.getAnimations().every(animation=>animation.playState!=='running');
   },selector);
  }

  async function currentScore(expected){
   assert.match(await score.textContent(),new RegExp('^\\s*'+expected+'\\s*/\\s*6\\s*$'),'Score reflects unique collected stars');
   assert.equal(await mission.locator('[data-game-star][data-collected="true"]').count(),expected,'Every point belongs to one collected star');
  }
  async function axe(state,targetPage=page){
   const result=await new AxeBuilder({page:targetPage}).include('#star-mission').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   axeResults.push({state,violations:result.violations});
   assert.deepEqual(result.violations.map(violation=>violation.id),[],state+' accessibility: '+JSON.stringify(result.violations));
  }
  await start.focus();await page.keyboard.press('Enter');
  for(const star of await stars.all())assert.ok(await star.isVisible()&&await star.isEnabled(),'Starting makes every star playable');
  await currentScore(0);await axe('active keyboard mission');
  const initialRocket=await rocket.boundingBox();
  await stars.first().focus();await page.keyboard.press('Enter');
  await currentScore(1);
  assert.equal(await stars.first().getAttribute('aria-disabled'),'true','Collected stars expose their state to assistive technology');
  assert.equal(await stars.first().evaluate(element=>element===document.activeElement),true,'Collecting a star keeps keyboard focus stable');
  await page.keyboard.press('Enter');await currentScore(1);
  await page.waitForFunction(initial=>{
   const box=document.querySelector('#mission-rocket').getBoundingClientRect();
   return Math.abs(box.x-initial.x)>3||Math.abs(box.y-initial.y)>3;
  },initialRocket);
  for(const key of ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','ArrowRight']){
   await page.keyboard.press(key);
   assert.equal(await page.evaluate(()=>document.activeElement?.matches('button[data-game-star]:not([data-collected="true"])')),true,'Arrow navigation reaches a remaining star');
   await page.keyboard.press('Enter');
  }
  await currentScore(6);
  assert.match(await status.textContent(),/complete|explorer/i,'Completion has readable encouragement');
  assert.ok(await reset.isVisible(),'A child can replay the completed mission');
  assert.equal(await reset.evaluate(element=>element===document.activeElement),true,'Completion puts the replay action within keyboard reach');
  await axe('completed keyboard mission');
  await page.keyboard.press('Enter');await currentScore(0);
  for(const star of await stars.all()){
   assert.notEqual(await star.getAttribute('data-collected'),'true','Replay clears collected stars');
   assert.notEqual(await star.getAttribute('aria-disabled'),'true','Replay clears announced collected state');
  }

  // A fixed-size board or misplaced target would hide tappable stars on phones.
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});await board.scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'The page fits '+width+'px');
   const box=await board.boundingBox();
   assert.ok(box.x>=-1&&box.x+box.width<=width+1,'The complete game board fits '+width+'px');
   for(const star of await stars.all()){
    const target=await star.boundingBox();
    assert.ok(target.width>=44&&target.height>=44,'Star targets are at least 44px at '+width+'px');
    assert.ok(target.x>=box.x-1&&target.y>=box.y-1&&target.x+target.width<=box.x+box.width+1&&target.y+target.height<=box.y+box.height+1,'Every star stays inside the board at '+width+'px');
   }
  }

  const launch=page.locator('.rocket-launch');
  assert.equal(await launch.count(),1,'An explicit launch button makes the rocket interaction discoverable');
  await launch.click();
  assert.ok((await page.locator('#launch-status').textContent()).trim(),'Launching has readable feedback');
  await page.waitForFunction(()=>document.querySelector('.space-cruiser').getAnimations().some(animation=>animation.playState==='running'&&animation.effect?.getTiming().iterations!==Infinity));
  await page.getByRole('button',{name:'Pause animations',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'Pause cancels active flight and decorative motion');
  await launch.click();
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'A paused launch gives feedback without movement');
  await board.scrollIntoViewIfNeeded();
  for(const star of await stars.all())await star.click();
  await currentScore(6);
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'A paused mission can finish without animation');
  await context.close();

  const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const phone=await touch.newPage();await phone.goto(base);
  await phone.locator('[data-game-start]').tap();
  const phoneStars=phone.locator('button[data-game-star]');
  const firstTarget=await phoneStars.first().boundingBox();
  await phoneStars.first().tap();
  // Send a real repeat tap: locator.tap() rejects aria-disabled controls itself.
  await phone.touchscreen.tap(firstTarget.x+firstTarget.width/2,firstTarget.y+firstTarget.height/2);
  assert.match(await phone.locator('#mission-score').textContent(),/1\s*\/\s*6/,'Repeated taps count a star once');
  for(let i=1;i<6;i++)await phoneStars.nth(i).tap();
  assert.match(await phone.locator('#mission-score').textContent(),/6\s*\/\s*6/,'Touch users can complete the mission');
  assert.match(await phone.locator('#mission-status').textContent(),/complete|explorer/i);
  await axe('completed touch mission',phone);
  await phone.locator('[data-game-reset]').tap();
  assert.match(await phone.locator('#mission-score').textContent(),/0\s*\/\s*6/,'Touch replay starts a fresh mission');
  await phone.locator('.rocket-launch').tap();
  assert.ok((await phone.locator('#launch-status').textContent()).trim());
  assert.equal(await phone.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'Reduced motion preserves the complete game without animation');
  await touch.close();

  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();await staticPage.goto(base);
  const staticMission=staticPage.locator('#star-mission');
  for(const control of await staticPage.locator('#star-mission button,.rocket-launch').all())assert.equal(await control.isVisible(),false,'Script-free pages do not expose inactive game controls');
  assert.ok((await staticMission.locator('img').all()).length,'The script-free game keeps space artwork');
  assert.ok((await Promise.all((await staticMission.locator('img').all()).map(image=>image.isVisible()))).some(Boolean),'Space artwork stays visible without scripts');
  assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Static space artwork fits a phone');
  await nojs.close();
  assert.deepEqual(errors,[],'Space interactions do not cause script errors');
  fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/space-game-accessibility.json',JSON.stringify(axeResults,null,2));
  console.log('PASS six-star mission, keyboard and touch collection/replay, score idempotency, focus, responsive targets, visible-only space motion, launch feedback, global pause, reduced motion, no-JS and accessibility');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
