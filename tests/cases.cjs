const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
const home=new URL('index.html',base).href;
const gallery=new URL('cases.html',base).href;
const counts=[4,2,2,4,4];
const caseId=index=>'case-'+String(index+1).padStart(2,'0');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(home);
  const preview=page.locator('#cases');
  assert.equal(await preview.count(),1,'Home keeps a compact introduction to the clinical cases');
  assert.equal(await page.locator('[data-case-tab], [data-case-panel], #case-viewer').count(),0,'The complete gallery and viewer live on their own page');
  const previewLinks=preview.locator('a[href^="cases.html#case-"]').filter({has:page.locator('img')});
  assert.deepEqual(await previewLinks.evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['cases.html#case-01','cases.html#case-03','cases.html#case-04'],'Home previews three reviewed cases');
  assert.equal(await preview.getByRole('link',{name:/View all cases/i}).getAttribute('href'),'cases.html','Home links to the dedicated cases page');
  for(const link of await previewLinks.all()){
   await link.click();
   assert.equal(await page.locator('[data-case-tab][aria-selected="true"]').getAttribute('href'),new URL(page.url()).hash,'A preview opens the selected case');
   await page.goto(home);
  }
  await page.goto(gallery);
  const portfolio=page.locator('main a[href="https://canva.link/fthzw69hi5kx71g"]');
  assert.equal(await portfolio.count(),1,'Cases includes the doctor’s verified external portfolio once in its main content');
  assert.equal(await portfolio.isVisible(),true,'The portfolio link is visible alongside the local cases');
  assert.match(await portfolio.innerText(),/portfolio/i,'The external destination is clearly labelled as a portfolio');
  assert.equal(await portfolio.getAttribute('target'),'_blank','The external portfolio opens separately from the local galleries');
  const portfolioRel=(await portfolio.getAttribute('rel')||'').split(/\s+/);
  assert.ok(portfolioRel.includes('noopener')&&portfolioRel.includes('noreferrer'),'The portfolio link protects the originating page and referrer');
  const tabs=page.locator('.case-tabs [data-case-tab]');
  const panels=page.locator('[data-case-panel]');
  const dialog=page.locator('#case-viewer');
  const viewerImage=dialog.locator('.case-viewer-image');
  assert.equal(await tabs.count(),5,'All five supplied treatments need a selector');
  assert.equal(await panels.count(),5,'All five supplied treatments need a static gallery');
  assert.equal(await tabs.first().getAttribute('role'),'tab','Gallery selectors progressively become ARIA tabs');
  assert.equal(await page.locator('.case-tabs').getAttribute('aria-orientation'),'vertical','Desktop case selection uses a vertical tab list');

  async function selected(index){
   assert.equal(await tabs.nth(index).getAttribute('aria-selected'),'true','Correct treatment is selected');
   assert.equal(await tabs.nth(index).getAttribute('tabindex'),'0','Selected treatment is in the tab order');
   assert.equal(await page.locator('.case-tabs [aria-selected="true"]').count(),1,'Only one treatment is selected');
   for(let i=0;i<counts.length;i++)assert.equal(await page.locator('#'+caseId(i)).isVisible(),i===index,'Only the selected gallery is shown');
  }
  async function loaded(){
   await viewerImage.waitFor({state:'visible'});
   await page.waitForFunction(()=>{
    const image=document.querySelector('#case-viewer .case-viewer-image');
    return image&&image.complete&&image.naturalWidth>0;
   });
   assert.ok((await viewerImage.getAttribute('alt')).trim(),'Clinical photographs need descriptive alternative text');
  }
  async function counter(position,total){
   const numbers=(await page.locator('#case-viewer-counter').textContent()).match(/\d+/g);
   assert.deepEqual(numbers&&numbers.map(Number),[position,total],'Viewer identifies the photograph without inventing treatment stages');
  }
  async function open(link){
   await link.click();await dialog.waitFor({state:'visible'});await loaded();
   assert.equal(await dialog.evaluate(el=>el.open),true,'Photographs open in the native modal');
  }

  await selected(0);
  await tabs.first().focus();await page.keyboard.press('ArrowDown');await selected(1);
  assert.equal(await tabs.nth(1).evaluate(el=>el===document.activeElement),true,'Arrow navigation moves keyboard focus');
  await page.keyboard.press('End');await selected(4);
  await page.keyboard.press('Home');await selected(0);

  const deep=await context.newPage();
  await deep.goto(gallery+'#case-03');
  assert.equal(await deep.locator('[data-case-tab][aria-selected="true"]').getAttribute('href'),'#case-03','A case can be opened directly from its URL');
  assert.equal(await deep.locator('#case-03').isVisible(),true);await deep.close();

  const mobileDeep=await context.newPage();
  async function activeTabFits(){
   return mobileDeep.locator('.case-tabs').evaluate(list=>{
    const strip=list.getBoundingClientRect();
    const active=list.querySelector('[aria-selected="true"]').getBoundingClientRect();
    return active.left>=strip.left-1&&active.right<=strip.right+1;
   });
  }
  for(const width of [320,390]){
   await mobileDeep.setViewportSize({width,height:844});
   for(let i=0;i<counts.length;i++){
    await mobileDeep.goto(gallery+'?deep-check='+i+'#'+caseId(i),{waitUntil:'networkidle'});
    await mobileDeep.evaluate(()=>document.fonts.ready);
    assert.ok(await activeTabFits(),'Direct '+caseId(i)+' keeps its selected tab visible at '+width+'px');
    if(i===0){
     await mobileDeep.locator('[data-case-tab]').first().focus();
     await mobileDeep.keyboard.press('ArrowRight');
     await mobileDeep.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     assert.ok(await activeTabFits(),'Keyboard selection keeps the next mobile tab visible at '+width+'px');
    }
   }
  }
  await mobileDeep.setViewportSize({width:1440,height:1000});
  await mobileDeep.locator('[data-case-tab]').nth(3).click();
  await mobileDeep.setViewportSize({width:320,height:844});
  assert.ok(await activeTabFits(),'The active case tab remains visible after changing to a smaller mobile viewport');
  await mobileDeep.close();

  // Every supplied public derivative is opened through the actual gallery UI.
  for(let i=0;i<counts.length;i++){
   await tabs.nth(i).click();await selected(i);
   const thumbs=page.locator('#'+caseId(i)+' .case-thumb');
   assert.equal(await thumbs.count(),counts[i],caseId(i)+' has its reviewed photograph set');
   for(let j=0;j<counts[i];j++){
    const thumb=thumbs.nth(j);
    assert.ok(await thumb.getAttribute('href'),'Thumbnail retains a direct image link');
    await open(thumb);await counter(j+1,counts[i]);
    assert.ok((await page.locator('#case-viewer-title').textContent()).trim(),'The viewer identifies the treatment');
    await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    assert.equal(await thumb.evaluate(el=>el===document.activeElement),true,'Closing returns focus to the photograph that opened the viewer');
   }
  }

  await tabs.first().click();
  const cover=page.locator('#case-01 .case-cover');await open(cover);await counter(1,4);
  const firstImage=await viewerImage.getAttribute('src');
  await dialog.locator('[data-case-next]').click();await loaded();await counter(2,4);
  assert.notEqual(await viewerImage.getAttribute('src'),firstImage,'Next photograph changes the image');
  await dialog.locator('[data-case-prev]').click();await loaded();await counter(1,4);
  assert.equal(await viewerImage.getAttribute('src'),firstImage,'Previous photograph restores the prior image');
  await page.keyboard.press('ArrowRight');await loaded();await counter(2,4);
  await page.keyboard.press('ArrowLeft');await loaded();await counter(1,4);

  // Native modal focus must stay inside the viewer, including reverse tabbing.
  for(const key of [...Array(8).fill('Tab'),...Array(8).fill('Shift+Tab')]){
   await page.keyboard.press(key);
   assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'Modal keyboard focus stays inside the viewer');
  }
  const axeResults=[];
  const openAxe=await new AxeBuilder({page}).include('#case-viewer').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  axeResults.push({state:'open viewer',violations:openAxe.violations});
  assert.deepEqual(openAxe.violations.map(v=>v.id),[],'Open viewer accessibility: '+JSON.stringify(openAxe.violations));
  await dialog.locator('[data-case-close]').click();await dialog.waitFor({state:'hidden'});
  assert.equal(await cover.evaluate(el=>el===document.activeElement),true,'The close button also restores opener focus');

  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   await page.locator('#cases').scrollIntoViewIfNeeded();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Gallery does not overflow at '+width+'px');
   await tabs.nth(4).click();await selected(4);
   await open(page.locator('#case-05 .case-cover'));
   const box=await dialog.boundingBox();
   assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=width+1&&box.y+box.height<=901,'Photo viewer fits the viewport at '+width+'px');
   const imageBox=await viewerImage.boundingBox();
   assert.ok(imageBox.x>=box.x-1&&imageBox.y>=box.y-1&&imageBox.x+imageBox.width<=box.x+box.width+1&&imageBox.y+imageBox.height<=box.y+box.height+1,'Clinical image stays within the viewer at '+width+'px');
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   if(width===390||width===1440){
    const result=await new AxeBuilder({page}).include('#cases').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    axeResults.push({state:'gallery '+width,violations:result.violations});
    assert.deepEqual(result.violations.map(v=>v.id),[],'Case gallery accessibility at '+width+': '+JSON.stringify(result.violations));
   }
  }

  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();await staticPage.goto(gallery);
  for(let i=0;i<counts.length;i++){
   const panel=staticPage.locator('#'+caseId(i));
   assert.equal(await panel.isVisible(),true,'Every gallery remains available without JavaScript');
   const href=await panel.locator('.case-cover').getAttribute('href');
   const response=await nojs.request.get(new URL(href,gallery).href);
   assert.ok(response.ok(),'Static photo links work without JavaScript');
   assert.match(response.headers()['content-type'],/^image\//);
  }
  assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Static galleries fit a phone');
  await nojs.close();

  const reduce=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const reducedPage=await reduce.newPage();await reducedPage.goto(gallery);
  await reducedPage.locator('#case-01 .case-cover').click();
  await reducedPage.locator('#case-viewer').waitFor({state:'visible'});
  assert.equal(await reducedPage.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'Reduced motion opens photographs without animation');
  await reducedPage.keyboard.press('Escape');await reduce.close();
  assert.deepEqual(errors,[],'Case interactions cause no script errors');
  fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/cases-accessibility.json',JSON.stringify(axeResults,null,2));
  console.log('PASS compact Home preview, dedicated five case galleries, all 16 photographs, keyboard tabs, deep links, modal controls/focus, four widths, no-JS, reduced motion, and gallery/viewer accessibility');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
