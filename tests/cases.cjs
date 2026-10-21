const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
const home=new URL('index.html',base).href;
const gallery=new URL('cases.html',base).href;
const legacy=[{id:'case-01',imageCount:4},{id:'case-02',imageCount:2},{id:'case-03',imageCount:2},{id:'case-04',imageCount:4},{id:'case-05',imageCount:4}];

// Independently recorded source-review expectations catch omissions even when
// production JSON and generated HTML agree with each other.
const fixturePath=path.join(__dirname,'fixtures/case-review.json');
assert.ok(fs.existsSync(fixturePath),'The complete portfolio requires an independent case/page review fixture');
const review=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/cases.json'),'utf8'));
const expected=review.cases;
const ids=expected.map(item=>item.id);
assert.equal(review.sourcePageCount,107);
assert.deepEqual(review.pages.map(item=>item.page).sort((a,b)=>a-b),Array.from({length:107},(_,i)=>i+1),'Every one of the 107 source pages has exactly one review decision');
assert.equal(new Set(ids).size,ids.length);
assert.deepEqual(catalog.map(item=>item.id),ids,'The catalog includes exactly the independently reviewed groups');
for(const item of expected){
 const actual=catalog.find(candidate=>candidate.id===item.id);
 assert.equal(actual.images.length,item.imageCount,item.id+' retains the reviewed image count');
 assert.equal(actual.category,item.category,item.id+' retains the reviewed treatment category');
 assert.deepEqual(actual.sourcePages||[],item.sourcePages||[],item.id+' retains its reviewed source pages');
}
for(const item of legacy)assert.equal(catalog.find(candidate=>candidate.id===item.id)?.images.length,item.imageCount,item.id+' preserves its supplied images and stable link');
for(const page of review.pages){
 assert.ok(['included','excluded'].includes(page.disposition),'Page '+page.page+' has a resolved publication decision');
 if(page.disposition==='excluded')assert.ok(page.reason?.trim(),'Excluded page '+page.page+' records its reason');
 else{
  assert.ok(page.caseIds?.length,'Included page '+page.page+' maps to a gallery');
  for(const id of page.caseIds)assert.ok(expected.find(item=>item.id===id)?.sourcePages?.includes(page.page),'Page '+page.page+' maps consistently to '+id);
 }
}

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(home);
  const preview=page.locator('#cases');
  assert.equal(await preview.count(),1,'Home keeps its compact case introduction');
  assert.equal(await page.locator('[data-case-tab], [data-case-panel], #case-viewer').count(),0,'The full library lives on Cases');
  const previewLinks=preview.locator('a[href^="cases.html#case-"]').filter({has:page.locator('img')});
  assert.deepEqual(await previewLinks.evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['cases.html#case-01','cases.html#case-03','cases.html#case-04'],'Home preserves its reviewed destinations');
  assert.equal(await preview.getByRole('link',{name:/View all cases/i}).getAttribute('href'),'cases.html');
  for(const link of await previewLinks.all()){
   await link.click();
   assert.equal(await page.locator('[data-case-tab][aria-selected=true]').getAttribute('href'),new URL(page.url()).hash);
   await page.goto(home);
  }
  const requests=new Set();page.on('request',request=>requests.add(request.url().split('?')[0]));
  await page.goto(gallery);await page.evaluate(()=>document.fonts.ready);
  const tabs=page.locator('.case-tabs [data-case-tab]');
  const panels=page.locator('[data-case-panel]');
  const dialog=page.locator('#case-viewer');
  const viewerImage=dialog.locator('.case-viewer-image');
  const category=page.locator('#case-category'),search=page.locator('#case-search'),clear=page.locator('#case-clear-filters');
  const empty=page.locator('#case-no-results');
  const axeResults=[];
  assert.equal(await page.locator('.case-filters:visible').count(),1,'The enhanced library exposes filters and search');
  assert.deepEqual(await category.locator('option').evaluateAll(options=>options.map(option=>option.value).sort()),['',...new Set(expected.map(item=>item.category))].sort(),'Every reviewed treatment category is available to filter');
  assert.deepEqual(await tabs.evaluateAll(links=>links.map(link=>link.getAttribute('href').slice(1))),ids,'Each reviewed group has a native selector');
  assert.deepEqual(await panels.evaluateAll(items=>items.map(item=>item.id)),ids,'Each reviewed group has a static article');
  assert.equal(await page.locator('main .portfolio-callout').count(),0,'Cases provides the complete native library');
  assert.equal(await tabs.first().getAttribute('role'),'tab');
  assert.equal(await page.locator('.case-tabs').getAttribute('aria-orientation'),'vertical');
  const fullUrls=await page.locator('.case-thumb[href]').evaluateAll(links=>[...new Set(links.map(link=>link.href))]);
  const distantUrls=await panels.last().locator('.case-thumb[href]').evaluateAll(links=>links.map(link=>link.href));
  assert.ok(distantUrls.every(url=>!requests.has(url)),'Distant unopened cases defer their full images');
  assert.ok(fullUrls.filter(url=>requests.has(url)).length<Math.min(8,fullUrls.length),'Entry loads a small selection of full images');

  async function selected(id){
   const active=page.locator('[data-case-tab][aria-selected=true]');
   assert.equal(await active.count(),1);
   assert.equal(await active.getAttribute('href'),'#'+id);
   assert.equal(await active.getAttribute('tabindex'),'0');
   assert.deepEqual(await page.locator('[data-case-panel]:visible').evaluateAll(items=>items.map(item=>item.id)),[id],'Only the selected case is visible');
  }
  async function loaded(){
   await viewerImage.waitFor({state:'visible'});
   await page.waitForFunction(()=>{const image=document.querySelector('.case-viewer-image');return image?.complete&&image.naturalWidth>0});
   assert.ok((await viewerImage.getAttribute('alt')).trim(),'Clinical images need descriptive alternatives');
  }
  async function counter(position,total){assert.equal(await page.locator('#case-viewer-counter').textContent(),`Image ${position} of ${total}`)}
  async function open(link){
   await link.click();await dialog.waitFor({state:'visible'});await loaded();
   assert.equal(await dialog.evaluate(el=>el.open),true);
   const caption=await link.evaluate(el=>el.dataset.caption||el.closest('figure')?.querySelector('figcaption')?.textContent||el.querySelector('img').alt);
   assert.equal(await page.locator('#case-viewer-caption').textContent(),caption,'The viewer preserves the selected caption');
  }
  async function close(opener){
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   assert.equal(await opener.evaluate(el=>el===document.activeElement),true,'Closing returns focus to the opener');
  }
  await selected(ids[0]);await tabs.first().focus();await page.keyboard.press('ArrowDown');await selected(ids[1]);
  assert.equal(await tabs.nth(1).evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('End');await selected(ids.at(-1));await page.keyboard.press('Home');await selected(ids[0]);

  // Known reviewed treatments detect a missing predicate, normalization, or AND.
  await search.fill('ZIRCONIA');
  const crownResults=await page.locator('[data-case-tab]:visible').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  assert.ok(crownResults.includes('#case-03'));
  assert.ok(!crownResults.includes('#case-01'),'Search excludes unrelated appliance work');
  assert.equal(await page.locator('#case-results-status').textContent(),`${crownResults.length} of ${ids.length} cases`,'The result count follows the filtered case set');
  assert.equal(await search.evaluate(el=>el===document.activeElement),true,'Search retains focus while filtering');
  await search.fill('zirconia');
  assert.deepEqual(await page.locator('[data-case-tab]:visible').evaluateAll(links=>links.map(link=>link.getAttribute('href'))),crownResults,'Search ignores letter case');
  for(const [query,id] of [['prevention','portfolio-070'],['full mouth','portfolio-018'],['band and loop','case-04']]){
   await search.fill(query);
   assert.equal(await page.locator('[data-case-tab][href="#'+id+'"]').isVisible(),true,'Search finds the expected treatment for '+query);
  }
  await search.fill('zirconia');
  const applianceCategory=expected.find(item=>item.id==='case-01').category;
  const crownCategory=expected.find(item=>item.id==='case-03').category;
  assert.notEqual(applianceCategory,crownCategory);
  await category.selectOption(applianceCategory);
  assert.equal(await page.locator('[data-case-tab][href="#case-03"]').isVisible(),false,'Search and treatment category combine');
  await clear.click();await search.fill('band');
  const filtered=await page.locator('[data-case-tab]:visible').evaluateAll(links=>links.map(link=>link.getAttribute('href').slice(1)));
  assert.ok(filtered.includes('case-04')&&filtered.includes('case-05'));
  await page.locator('[data-case-tab][href="#'+filtered[0]+'"]').focus();
  await page.keyboard.press('ArrowDown');await selected(filtered[1]);
  await page.keyboard.press('End');await selected(filtered.at(-1));
  await page.keyboard.press('Home');await selected(filtered[0]);
  await page.keyboard.press('ArrowUp');await selected(filtered.at(-1));
  await search.fill('no-such-case-qzxv-123456');
  assert.equal(await empty.isVisible(),true,'Empty searches explain the lack of matches');
  assert.equal(await page.locator('[data-case-tab]:visible').count(),0);
  assert.equal(await page.locator('[data-case-panel]:visible').count(),0,'Empty results cannot show unrelated cases');
  assert.match(await page.locator('#case-results-status').textContent(),/^0\b/);
  await clear.click();
  assert.equal(await empty.isVisible(),false);assert.equal(await search.inputValue(),'');assert.equal(await category.inputValue(),'');
  assert.equal(await page.locator('[data-case-tab]:visible').count(),ids.length);
  await page.locator('[data-case-tab][href="#case-03"]').click();await search.fill('zirconia');await selected('case-03');
  await page.evaluate(()=>{location.hash='case-01'});
  await page.waitForFunction(()=>document.querySelector('#case-01').hidden===false);await selected('case-01');
  assert.equal(await search.inputValue(),'','A hash opens a case hidden by search');
  await category.selectOption(crownCategory);await page.evaluate(()=>{location.hash='case-05'});
  await page.waitForFunction(()=>document.querySelector('#case-05').hidden===false);await selected('case-05');
  assert.equal(await category.inputValue(),'','A hash opens a case hidden by category');

  const deep=await context.newPage();
  for(const width of [320,390]){
   await deep.setViewportSize({width,height:844});
   for(const id of ['case-03',ids.at(-1)]){
    await deep.goto(gallery+'#'+id);await deep.evaluate(()=>document.fonts.ready);
    assert.equal(await deep.locator('[data-case-tab][aria-selected=true]').getAttribute('href'),'#'+id);
    assert.equal(await deep.locator('.case-tabs').getAttribute('aria-orientation'),'vertical');
    assert.ok(await deep.locator('.case-tabs').evaluate(list=>{const active=list.querySelector('[aria-selected=true]').getBoundingClientRect();const bounds=list.getBoundingClientRect();return active.top>=bounds.top-1&&active.bottom<=bounds.bottom+1&&list.scrollHeight>list.clientHeight&&bounds.height<=252}),'The selected case fits in the bounded mobile result list');
   }
  }
  await deep.close();

  // All actual assets decode; modal behavior is exercised on representative cases.
  const assetUrls=await page.locator('.case-photo').evaluateAll(links=>[...new Set(links.flatMap(link=>[link.href,link.querySelector('img').src]))]);
  for(let offset=0;offset<assetUrls.length;offset+=16){
   const failures=await page.evaluate(async urls=>(await Promise.all(urls.map(async url=>{try{const image=new Image();image.src=url;await image.decode();return image.naturalWidth>0?null:url}catch{return url}}))).filter(Boolean),assetUrls.slice(offset,offset+16));
   assert.deepEqual(failures,[],'Every reviewed image and thumbnail decodes');
  }
  for(const item of expected)assert.equal(await page.locator('#'+item.id+' .case-thumb[href]').count(),item.imageCount,item.id+' retains every reviewed direct link');
  const representatives=[...new Set([...legacy.map(item=>item.id),expected.find(item=>item.imageCount===1)?.id,expected.reduce((largest,item)=>item.imageCount>largest.imageCount?item:largest).id,ids.at(-1),...(review.criticalIds||[])].filter(Boolean))];
  for(const id of representatives){
   await page.locator('[data-case-tab][href="#'+id+'"]').click();await selected(id);
   const count=expected.find(item=>item.id===id).imageCount;
   for(const index of [...new Set([0,count-1])]){
    const thumb=page.locator('#'+id+' .case-thumb').nth(index);await open(thumb);await counter(index+1,count);
    assert.equal(await dialog.locator('[data-case-next]').isDisabled(),count===1,'Single-image cases omit redundant navigation');
    await close(thumb);
   }
  }
  await page.locator('[data-case-tab][href="#case-01"]').click();
  const cover=page.locator('#case-01 .case-cover');await open(cover);await counter(1,4);
  const firstImage=await viewerImage.getAttribute('src');
  await dialog.locator('[data-case-next]').click();await loaded();await counter(2,4);assert.notEqual(await viewerImage.getAttribute('src'),firstImage);
  await dialog.locator('[data-case-prev]').click();await loaded();await counter(1,4);assert.equal(await viewerImage.getAttribute('src'),firstImage);
  for(const [key,position] of [['ArrowRight',2],['ArrowLeft',1],['End',4],['Home',1]]){await page.keyboard.press(key);await loaded();await counter(position,4)}
  for(const key of [...Array(6).fill('Tab'),...Array(6).fill('Shift+Tab')]){
   await page.keyboard.press(key);assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'Keyboard focus stays inside the modal');
  }
  const modalAxe=await new AxeBuilder({page}).include('#case-viewer').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  axeResults.push({state:'open viewer',violations:modalAxe.violations});assert.deepEqual(modalAxe.violations.map(v=>v.id),[]);
  await dialog.locator('[data-case-close]').click();await dialog.waitFor({state:'hidden'});
  assert.equal(await cover.evaluate(el=>el===document.activeElement),true);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'The library fits '+width+'px');
   await page.locator('[data-case-tab][href="#case-05"]').click();await selected('case-05');await open(page.locator('#case-05 .case-cover'));
   const box=await dialog.boundingBox(),imageBox=await viewerImage.boundingBox();
   assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=width+1&&box.y+box.height<=901,'The viewer fits '+width+'px');
   assert.ok(imageBox.x>=box.x-1&&imageBox.y>=box.y-1&&imageBox.x+imageBox.width<=box.x+box.width+1&&imageBox.y+imageBox.height<=box.y+box.height+1,'Clinical images stay inside the viewer');
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   if(width===390||width===1440){
    const result=await new AxeBuilder({page}).include('#cases').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    axeResults.push({state:'library '+width,violations:result.violations});assert.deepEqual(result.violations.map(v=>v.id),[],'Library accessibility: '+JSON.stringify(result.violations));
   }
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();await staticPage.goto(gallery);
  assert.equal(await staticPage.locator('.case-filters').isVisible(),false,'Inactive search controls remain hidden without JavaScript');
  assert.ok((await staticPage.locator('.case-tabs').boundingBox()).height<=252,'The native mobile case index remains bounded without JavaScript');
  assert.deepEqual(await staticPage.locator('[data-case-panel]:visible').evaluateAll(items=>items.map(item=>item.id)),ids,'All reviewed galleries remain available without JavaScript');
  assert.equal(await staticPage.locator('.case-thumb[href]').count(),expected.reduce((sum,item)=>sum+item.imageCount,0));
  const href=await staticPage.locator('#'+ids.at(-1)+' .case-cover').getAttribute('href');
  const response=await nojs.request.get(new URL(href,gallery).href);assert.ok(response.ok());assert.match(response.headers()['content-type'],/^image\//);
  assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await nojs.close();
  const reduce=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const reducedPage=await reduce.newPage();await reducedPage.goto(gallery);
  await reducedPage.locator('#case-01 .case-cover').click();await reducedPage.locator('#case-viewer').waitFor({state:'visible'});
  assert.equal(await reducedPage.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'Reduced motion opens images without animation');
  await reducedPage.keyboard.press('Escape');await reduce.close();
  assert.deepEqual(errors,[]);
  fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/cases-accessibility.json',JSON.stringify(axeResults,null,2));
  console.log(`PASS independently reviewed ${ids.length}-case library, every derivative/link, filters/search, keyboard/deep links, modal captions/controls/focus, responsive/no-JS/reduced-motion and accessibility`);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
