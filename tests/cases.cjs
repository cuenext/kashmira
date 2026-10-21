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
assert.equal(ids.length,87,'All 87 independently reviewed galleries remain published');
assert.equal(expected.reduce((sum,item)=>sum+item.imageCount,0),521,'All 521 independently reviewed images remain published');
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
for(const sourcePage of review.pages){
 assert.ok(['included','excluded'].includes(sourcePage.disposition),'Page '+sourcePage.page+' has a resolved publication decision');
 if(sourcePage.disposition==='excluded')assert.ok(sourcePage.reason?.trim(),'Excluded page '+sourcePage.page+' records its reason');
 else{
  assert.ok(sourcePage.caseIds?.length,'Included page '+sourcePage.page+' maps to a gallery');
  for(const id of sourcePage.caseIds)assert.ok(expected.find(item=>item.id===id)?.sourcePages?.includes(sourcePage.page),'Page '+sourcePage.page+' maps consistently to '+id);
 }
}

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const requests=new Set();page.on('request',request=>requests.add(request.url().split('?')[0]));
  await page.goto(gallery);await page.evaluate(()=>document.fonts.ready);
  const cards=page.locator('.case-tabs.case-grid [data-case-tab]');
  const panels=page.locator('[data-case-panel]');
  const detail=page.locator('#case-detail');
  const dialog=page.locator('#case-viewer');
  const viewerImage=dialog.locator('.case-viewer-image');
  const category=page.locator('#case-category'),search=page.locator('#case-search'),clear=page.locator('#case-clear-filters');
  const chips=page.locator('.case-category-chips [data-case-category]');
  const empty=page.locator('#case-no-results'),more=page.locator('#case-load-more');
  const axeResults=[];
  const visibleIds=()=>cards.filter({visible:true}).evaluateAll(links=>links.map(link=>link.getAttribute('href').slice(1)));
  const card=id=>page.locator('[data-case-tab][href="#'+id+'"]');
  const cardInViewport=locator=>locator.evaluate(el=>{
   const rect=el.getBoundingClientRect(),header=document.querySelector('.site-header')?.getBoundingClientRect();
   const booking=document.querySelector('.mobile-book'),bookingRect=booking?.getClientRects().length?booking.getBoundingClientRect():null;
   const top=Math.max(0,header?.bottom||0),bottom=bookingRect?Math.min(innerHeight,bookingRect.top):innerHeight;
   return rect.bottom>top&&rect.top<bottom;
  });
  async function expectStatus(shown,total){assert.equal((await page.locator('#case-results-status').textContent()).trim(),`Showing ${shown} of ${total} cases`)}
  async function expectClosed(){
   await detail.waitFor({state:'hidden'});
   assert.equal(await detail.evaluate(el=>el.open),false);
   assert.equal(await page.locator('[data-case-panel]:visible').count(),0,'Closed detail does not leave a selected gallery visible');
   assert.deepEqual(await page.locator('#case-panels > [data-case-panel]').evaluateAll(items=>items.map(item=>item.id)),ids,'Closing restores every static article in its original order');
  }
  async function expectCase(id){
   await detail.waitFor({state:'visible'});
   assert.equal(await detail.evaluate(el=>el.open),true);
   assert.deepEqual(await page.locator('[data-case-panel]:visible').evaluateAll(items=>items.map(item=>item.id)),[id],'Only the chosen gallery is visible');
   assert.deepEqual(await detail.locator('#case-detail-content > [data-case-panel]').evaluateAll(items=>items.map(item=>item.id)),[id],'The selected static article moves into the dialog');
   assert.equal(await page.locator('#case-panels > [data-case-panel]').count(),86,'A case is moved without duplicating its photographs');
   assert.equal((await detail.locator('#case-detail-title').textContent()).trim(),catalog.find(item=>item.id===id).title);
   assert.ok((await detail.locator('#case-detail-category').textContent()).trim(),'The open case identifies its treatment');
   const focused=await page.waitForFunction(()=>document.querySelector('#case-detail')?.contains(document.activeElement),null,{timeout:1500}).then(()=>true,()=>false);
   assert.equal(focused,true,'Case entry focuses a control inside the dialog: '+await page.evaluate(()=>document.activeElement?.outerHTML?.slice(0,200)));
  }
  async function closeCase(id,key='Escape'){
   if(key==='Escape')await page.keyboard.press('Escape');else await detail.locator('[data-case-detail-close]').click();
   await expectClosed();
   assert.equal(await card(id).evaluate(el=>el===document.activeElement),true,'Closing case detail returns focus to its preview card');
  }
  async function revealCard(id){
   while(!await card(id).isVisible()){
    assert.equal(await more.isVisible(),true,'The next page can reveal '+id);
    await more.click();
   }
  }
  async function openCase(id){await revealCard(id);await card(id).click();await expectCase(id)}
  async function loaded(){
   await viewerImage.waitFor({state:'visible'});
   await page.waitForFunction(()=>{const image=document.querySelector('.case-viewer-image');return image?.complete&&image.naturalWidth>0});
   assert.ok((await viewerImage.getAttribute('alt')).trim(),'Clinical images need descriptive alternatives');
  }
  async function counter(position,total){assert.equal(await page.locator('#case-viewer-counter').textContent(),`Image ${position} of ${total}`)}
  async function openPhoto(link){
   await link.click();await dialog.waitFor({state:'visible'});await loaded();
   assert.equal(await dialog.evaluate(el=>el.open),true);
   assert.equal(await detail.evaluate(el=>el.open),true,'A photograph opens above the still-open case detail');
   const caption=await link.evaluate(el=>el.dataset.caption||el.closest('figure')?.querySelector('figcaption')?.textContent||el.querySelector('img').alt);
   assert.equal(await page.locator('#case-viewer-caption').textContent(),caption,'The viewer preserves the selected caption');
  }
  async function closePhoto(opener){
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   assert.equal(await detail.evaluate(el=>el.open),true,'The first Escape closes only the photograph');
   assert.equal(await opener.evaluate(el=>el===document.activeElement),true,'Closing a photograph returns focus to its opener');
  }
  async function caseAnimations(){return page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running'&&animation.effect?.target?.closest?.('.case-grid, [data-case-panel], #case-detail, #case-viewer')).length)}
  async function settle(){await page.waitForFunction(()=>!document.getAnimations().some(animation=>animation.playState==='running'&&animation.effect?.target?.closest?.('.case-grid, [data-case-panel], #case-detail, #case-viewer')))}
  async function observeMotion(action){
   await settle();
   return page.evaluate(async action=>{
    if(action.input){const input=document.querySelector(action.input);input.value=action.value;input.dispatchEvent(new Event('input',{bubbles:true}))}
    else document.querySelector(action.click).click();
    await new Promise(requestAnimationFrame);
    const animations=document.getAnimations().filter(animation=>animation.playState==='running'&&animation.effect?.target?.closest?.('.case-grid, [data-case-panel], #case-detail, #case-viewer'));
    const first=animations.map(animation=>{const target=animation.effect.target,style=getComputedStyle(target);return {target,transform:style.transform,opacity:style.opacity,time:animation.currentTime}});
    await new Promise(resolve=>setTimeout(resolve,65));
    return {count:animations.length,changed:first.some((before,index)=>{const style=getComputedStyle(before.target);return animations[index].currentTime>before.time&&(style.transform!==before.transform||style.opacity!==before.opacity)})};
   },action);
  }

  // A card grid catches the old always-selected sidebar presentation.
  assert.equal(await cards.filter({visible:true}).count(),12,'The gallery opens with twelve photo preview cards');
  assert.equal(await cards.locator('img').count(),87,'Every reviewed case has a photo preview');
  assert.equal(await page.locator('[data-case-panel]:visible').count(),0,'Cases open only after choosing a card');
  assert.equal(await detail.count(),1,'The case detail dialog is available');
  assert.equal(await detail.evaluate(el=>el.tagName),'DIALOG');
  assert.equal(await page.locator('#cases #case-detail').count(),1,'Case detail stays within the library');
  assert.equal(await page.locator('#cases #case-viewer').count(),0,'The photo viewer can sit above the case dialog');
  assert.equal(await detail.getAttribute('aria-labelledby'),'case-detail-title');
  assert.equal(await page.locator('.case-filters:visible').count(),1,'The enhanced library exposes filters and search');
  assert.equal(await category.isVisible(),false,'Desktop browsing offers the treatment chips');
  assert.equal(await page.locator('.case-category-chips').isVisible(),true);
  assert.deepEqual(await category.locator('option').evaluateAll(options=>options.map(option=>option.value).sort()),['',...new Set(expected.map(item=>item.category))].sort(),'Every reviewed treatment category is available to filter');
  assert.deepEqual(await chips.evaluateAll(buttons=>buttons.map(button=>button.dataset.caseCategory).sort()),['',...new Set(expected.map(item=>item.category))].sort(),'Desktop treatment buttons match the native mobile choices');
  assert.equal(await chips.filter({hasText:/all/i}).first().getAttribute('aria-pressed'),'true');
  assert.deepEqual(await cards.evaluateAll(links=>links.map(link=>link.getAttribute('href').slice(1))),ids,'Each reviewed group has a native selector');
  assert.deepEqual(await panels.evaluateAll(items=>items.map(item=>item.id)),ids,'Each reviewed group has a static article');
  assert.equal(await page.locator('main .portfolio-callout').count(),0,'Cases provides the complete native library');
  assert.deepEqual(await visibleIds(),ids.slice(0,12));await expectStatus(12,87);
  assert.equal(await cards.evaluateAll(links=>links.every(link=>link.tagName==='A'&&!link.hasAttribute('role')&&!link.hasAttribute('aria-selected')&&!link.hasAttribute('tabindex'))),true,'Preview links use normal Tab and Enter behavior');
  assert.equal(await cards.evaluateAll(links=>links.every(link=>link.textContent.trim().length>0)),true,'Every preview link has its case name');
  await cards.first().focus();await page.keyboard.press('Tab');
  assert.equal(await cards.nth(1).evaluate(el=>el===document.activeElement),true,'Tab moves naturally to the next card');
  await page.keyboard.press('ArrowDown');
  assert.equal(await detail.isVisible(),false,'Arrow keys do not open an unrelated case');
  const fullUrls=await page.locator('.case-thumb[href]').evaluateAll(links=>[...new Set(links.map(link=>link.href))]);
  const distantUrls=await panels.last().locator('.case-thumb[href]').evaluateAll(links=>links.map(link=>link.href));
  assert.ok(distantUrls.every(url=>!requests.has(url)),'Distant unopened cases defer their full images');
  assert.ok(fullUrls.filter(url=>requests.has(url)).length<Math.min(8,fullUrls.length),'Entry loads a small selection of full images');
  for(const image of await cards.filter({visible:true}).locator('img').all()){
   await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());
   assert.ok(await image.evaluate(image=>image.naturalWidth>0),'The initial photo previews decode');
  }
  await more.click();assert.deepEqual(await visibleIds(),ids.slice(0,24));await expectStatus(24,87);
  assert.equal(await cards.nth(12).evaluate(el=>el===document.activeElement),true,'Loading more focuses the first newly revealed card');
  let previousShown=24;
  for(const shown of [36,48,60,72,84,87]){
   await more.click();assert.deepEqual(await visibleIds(),ids.slice(0,shown));await expectStatus(shown,87);
   assert.equal(await cards.nth(previousShown).evaluate(el=>el===document.activeElement),true,'Every new page focuses its first card');previousShown=shown;
  }
  assert.equal(await more.isVisible(),false,'The final partial page does not offer an empty extra page');
  await search.fill('');

  // Literal reviewed examples catch missing search normalization or AND logic.
  await search.fill('ZIRCONIA');
  const crownResults=await visibleIds();
  assert.ok(crownResults.includes('case-03'));assert.ok(!crownResults.includes('case-01'),'Search excludes unrelated appliance work');
  await expectStatus(crownResults.length,crownResults.length);
  assert.equal(await search.evaluate(el=>el===document.activeElement),true,'Search retains focus while filtering');
  await search.fill('zirconia');assert.deepEqual(await visibleIds(),crownResults,'Search ignores letter case');
  for(const [query,id] of [['prevention','portfolio-070'],['full mouth','portfolio-018'],['band and loop','case-04']]){
   await search.fill(query);assert.equal(await card(id).isVisible(),true,'Search finds the expected treatment for '+query);
  }
  const applianceCategory=expected.find(item=>item.id==='case-01').category;
  const crownCategory=expected.find(item=>item.id==='case-03').category;
  assert.notEqual(applianceCategory,crownCategory);
  await search.fill('zirconia');await page.locator('[data-case-category="'+applianceCategory+'"]').click();
  assert.equal(await category.inputValue(),applianceCategory,'Desktop treatment choice keeps the native selector synchronized');
  assert.equal(await page.locator('[data-case-category="'+applianceCategory+'"]').getAttribute('aria-pressed'),'true');
  assert.equal(await card('case-03').isVisible(),false,'Search and treatment category combine');
  assert.equal(await empty.isVisible(),true);await expectStatus(0,0);
  await clear.click();assert.deepEqual(await visibleIds(),ids.slice(0,12),'Clearing filters restores the first page');await expectStatus(12,87);
  const categoryIds=expected.filter(item=>item.category===applianceCategory).map(item=>item.id);
  await page.locator('[data-case-category="'+applianceCategory+'"]').click();
  assert.deepEqual(await visibleIds(),categoryIds.slice(0,12),'Category filtering retains the independent review order');
  await expectStatus(Math.min(12,categoryIds.length),categoryIds.length);
  await clear.click();await more.click();await search.fill('band');
  assert.deepEqual(await visibleIds(),['case-04','case-05','portfolio-019','portfolio-020','portfolio-022'],'The reviewed appliance search has only its five matching cards');
  await expectStatus(5,5);assert.equal(await more.isVisible(),false,'A complete filtered result does not offer an empty extra page');
  await search.fill('no-such-case-qzxv-123456');
  assert.equal(await empty.isVisible(),true,'Empty searches explain the lack of matches');
  assert.equal(await cards.filter({visible:true}).count(),0);assert.equal(await panels.filter({visible:true}).count(),0);
  await expectStatus(0,0);await clear.click();
  assert.equal(await empty.isVisible(),false);assert.equal(await search.inputValue(),'');assert.equal(await category.inputValue(),'');
  assert.deepEqual(await visibleIds(),ids.slice(0,12),'Filtering resets a previously expanded page');

  // Native Enter opens a case, and native modal focus cannot escape it.
  await cards.first().focus();await page.keyboard.press('Enter');await expectCase('case-01');
  for(const key of [...Array(8).fill('Tab'),...Array(8).fill('Shift+Tab')]){
   await page.keyboard.press(key);assert.equal(await detail.evaluate(el=>el.contains(document.activeElement)),true,'Keyboard focus stays inside case detail');
  }
  const detailAxe=await new AxeBuilder({page}).include('#case-detail').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  axeResults.push({state:'open case',violations:detailAxe.violations});assert.deepEqual(detailAxe.violations.map(v=>v.id),[],'Case detail accessibility: '+JSON.stringify(detailAxe.violations));
  const cover=page.locator('#case-01 .case-cover');await openPhoto(cover);await counter(1,4);
  const firstImage=await viewerImage.getAttribute('src');
  await dialog.locator('[data-case-next]').click();await loaded();await counter(2,4);assert.notEqual(await viewerImage.getAttribute('src'),firstImage);
  await dialog.locator('[data-case-prev]').click();await loaded();await counter(1,4);assert.equal(await viewerImage.getAttribute('src'),firstImage);
  for(const [key,position] of [['ArrowRight',2],['ArrowLeft',1],['End',4],['Home',1]]){await page.keyboard.press(key);await loaded();await counter(position,4)}
  for(const key of [...Array(6).fill('Tab'),...Array(6).fill('Shift+Tab')]){
   await page.keyboard.press(key);assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'Keyboard focus stays inside the photo viewer');
  }
  const modalAxe=await new AxeBuilder({page}).include('#case-viewer').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  axeResults.push({state:'open viewer',violations:modalAxe.violations});assert.deepEqual(modalAxe.violations.map(v=>v.id),[]);
  await closePhoto(cover);await closeCase('case-01');

  await search.fill('band');await openCase('case-04');
  await detail.locator('[data-case-detail-prev]').click();await expectCase('portfolio-022');
  await detail.locator('[data-case-detail-next]').click();await expectCase('case-04');
  await detail.locator('[data-case-detail-next]').click();await expectCase('case-05');
  await closeCase('case-05','button');assert.equal(await search.inputValue(),'band');await expectStatus(5,5);
  await search.fill('groper');assert.deepEqual(await visibleIds(),['case-01']);await openCase('case-01');
  assert.equal(await detail.locator('[data-case-detail-prev]').isDisabled(),true,'A single matching case disables previous');
  assert.equal(await detail.locator('[data-case-detail-next]').isDisabled(),true,'A single matching case disables next');
  await closeCase('case-01');await clear.click();
  await page.locator('[data-case-category="'+applianceCategory+'"]').click();
  await card('case-02').scrollIntoViewIfNeeded();await settle();
  const savedScroll=await page.evaluate(()=>scrollY),savedIds=await visibleIds();
  await openCase('case-02');await closeCase('case-02');
  assert.equal(await category.inputValue(),applianceCategory,'Closing preserves treatment choice');
  assert.deepEqual(await visibleIds(),savedIds,'Closing preserves the loaded page');
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-savedScroll)<=2,'Closing preserves library scroll position');
  await clear.click();await more.click();const expandedIds=await visibleIds();
  await openCase(ids[13]);await closeCase(ids[13]);assert.deepEqual(await visibleIds(),expandedIds,'Closing preserves an expanded page');
  await clear.click();await openCase('case-01');
  await detail.locator('[data-case-detail-prev]').click();await expectCase(ids.at(-1));
  await closeCase(ids.at(-1));
  assert.equal(await cardInViewport(card(ids.at(-1))),true,'Closing after previous wraps to the last case returns visibly focused preview');
  await openCase(ids.at(-1));
  await detail.locator('[data-case-detail-next]').click();await expectCase('case-01');await closeCase('case-01');

  // Deep links can reach cases beyond page one and remove conflicting filters.
  await search.fill('zirconia');await page.evaluate(()=>{location.hash='case-01'});await expectCase('case-01');
  assert.equal(await search.inputValue(),'','A hash opens a case hidden by search');
  await openPhoto(page.locator('#case-01 .case-cover'));await page.evaluate(()=>{location.hash='case-05'});await expectCase('case-05');
  assert.equal(await dialog.isVisible(),false,'Changing a deep link closes the previous case photograph');await closeCase('case-05');
  await page.locator('[data-case-category="'+crownCategory+'"]').click();await page.evaluate(()=>{location.hash='case-05'});await expectCase('case-05');
  assert.equal(await category.inputValue(),'','A hash opens a case hidden by category');await closeCase('case-05');
  await page.goto(gallery);await openCase('case-03');assert.equal(new URL(page.url()).hash,'#case-03');
  await page.goBack();await expectClosed();assert.equal(await card('case-03').evaluate(el=>el===document.activeElement),true,'Browser Back closes case detail and returns focus');
  const deep=await context.newPage();
  for(const width of [320,390]){
   await deep.setViewportSize({width,height:844});
   for(const id of ['case-03',ids.at(-1)]){
    await deep.goto(gallery+'#'+id);await deep.evaluate(()=>document.fonts.ready);
    await deep.locator('#case-detail').waitFor({state:'visible'});
    assert.deepEqual(await deep.locator('#case-detail-content [data-case-panel]:visible').evaluateAll(items=>items.map(item=>item.id)),[id],'Mobile deep links open their requested case');
    assert.equal(await deep.waitForFunction(()=>document.querySelector('#case-detail')?.contains(document.activeElement),null,{timeout:1500}).then(()=>true,()=>false),true,'Initial mobile deep links keep focus inside case detail');
    // Edge can perform its native fragment blur after initial modal focus.
    await deep.evaluate(()=>document.activeElement.blur());
    assert.equal(await deep.waitForFunction(()=>document.querySelector('#case-detail')?.contains(document.activeElement),null,{timeout:1500}).then(()=>true,()=>false),true,'A late native fragment blur recovers focus inside the open detail');
    await deep.keyboard.press('Escape');await deep.locator('#case-detail').waitFor({state:'hidden'});
    assert.equal(await deep.locator('[data-case-tab][href="#'+id+'"]').isVisible(),true,'Closing a deep link reveals its card beyond page one');
    assert.equal(await deep.locator('[data-case-tab][href="#'+id+'"]').evaluate(el=>el===document.activeElement),true);
    assert.equal(await cardInViewport(deep.locator('[data-case-tab][href="#'+id+'"]')),true,'Closing a mobile deep link returns visibly focused preview');
    assert.equal(await deep.locator('#case-category').isVisible(),true,'Mobile browsing retains the native treatment selector');
    assert.equal(await deep.locator('.case-category-chips').isVisible(),false,'Mobile treatment choices fit the small viewport');
    assert.equal(await deep.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Mobile deep-link results fit the viewport');
   }
   await deep.locator('#case-category').selectOption(applianceCategory);
   assert.deepEqual(await deep.locator('[data-case-tab]:visible').evaluateAll(links=>links.map(link=>link.getAttribute('href').slice(1))),categoryIds.slice(0,12),'The native mobile selector filters the reviewed case order');
   assert.equal(await deep.locator('[data-case-category="'+applianceCategory+'"]').getAttribute('aria-pressed'),'true','The mobile selector keeps the desktop choice synchronized');
   await deep.locator('#case-clear-filters').click();
   assert.equal(await deep.locator('#case-category').inputValue(),'','Mobile filters can return to every treatment');
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
   await openCase(id);
   const count=expected.find(item=>item.id===id).imageCount;
   for(const index of [...new Set([0,count-1])]){
    const thumb=page.locator('#'+id+' .case-thumb').nth(index);await openPhoto(thumb);await counter(index+1,count);
    assert.equal(await dialog.locator('[data-case-next]').isDisabled(),count===1,'Single-image cases omit redundant navigation');
    await closePhoto(thumb);
   }
   await closeCase(id);
  }
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'The library fits '+width+'px');
   await openCase('case-05');
   const caseBox=await detail.boundingBox();
   assert.ok(caseBox.x>=-1&&caseBox.y>=-1&&caseBox.x+caseBox.width<=width+1&&caseBox.y+caseBox.height<=901,'Case detail fits '+width+'px');
   await openPhoto(page.locator('#case-05 .case-cover'));
   const box=await dialog.boundingBox(),imageBox=await viewerImage.boundingBox();
   assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=width+1&&box.y+box.height<=901,'The viewer fits '+width+'px');
   assert.ok(imageBox.x>=box.x-1&&imageBox.y>=box.y-1&&imageBox.x+imageBox.width<=box.x+box.width+1&&imageBox.y+imageBox.height<=box.y+box.height+1,'Clinical images stay inside the viewer');
   await closePhoto(page.locator('#case-05 .case-cover'));await closeCase('case-05');
   if(width===390||width===1440){
    const result=await new AxeBuilder({page}).include('#cases').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    axeResults.push({state:'library '+width,violations:result.violations});assert.deepEqual(result.violations.map(v=>v.id),[],'Library accessibility: '+JSON.stringify(result.violations));
   }
  }

  // Measured style changes prove the requested motion actually runs.
  await page.setViewportSize({width:1440,height:1000});await page.goto(gallery);await page.locator('#cases').scrollIntoViewIfNeeded();
  for(const action of [{click:'#case-load-more'},{input:'#case-search',value:'band'}]){
   const motion=await observeMotion(action);assert.ok(motion.count>0&&motion.count<=12,'Case results use a bounded group of animations');assert.equal(motion.changed,true,'Case grid motion changes the rendered previews over time');
  }
  await clear.click();const entry=await observeMotion({click:'[data-case-tab][href="#case-01"]'});
  assert.ok(entry.count>0&&entry.count<=12);assert.equal(entry.changed,true,'Case entry visibly moves');await closeCase('case-01');
  const activePauseMotion=await observeMotion({click:'#case-load-more'});assert.ok(activePauseMotion.count>0,'There is active gallery motion to pause');
  await page.getByRole('button',{name:'Pause animations',exact:true}).click();
  assert.equal(await caseAnimations(),0,'Pause cancels gallery motion already in progress');
  await more.click();assert.equal(await caseAnimations(),0,'Pause disables load-more motion');
  await search.fill('groper');
  await search.fill('band');assert.equal(await caseAnimations(),0,'Pause disables filter motion');
  await openCase('case-04');assert.equal(await caseAnimations(),0,'Pause disables case entry motion');
  await openPhoto(page.locator('#case-04 .case-cover'));assert.equal(await caseAnimations(),0);await closePhoto(page.locator('#case-04 .case-cover'));await closeCase('case-04');
  await page.getByRole('button',{name:'Resume animations',exact:true}).click();
  const reduce=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const reducedPage=await reduce.newPage();await reducedPage.goto(gallery);
  await reducedPage.locator('#case-load-more').click();await reducedPage.locator('#case-search').fill('band');
  await reducedPage.locator('[data-case-tab][href="#case-04"]').click();await reducedPage.locator('#case-detail').waitFor({state:'visible'});
  await reducedPage.locator('#case-04 .case-cover').click();await reducedPage.locator('#case-viewer').waitFor({state:'visible'});
  assert.equal(await reducedPage.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0,'Reduced motion keeps grid, case, and image interactions still');
  await reducedPage.keyboard.press('Escape');assert.equal(await reducedPage.locator('#case-detail').evaluate(el=>el.open),true);
  await reducedPage.keyboard.press('Escape');await reduce.close();

  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();await staticPage.goto(gallery);
  assert.equal(await staticPage.locator('.case-filters').isVisible(),false,'Inactive search controls remain hidden without JavaScript');
  assert.equal(await staticPage.locator('#case-load-more').isVisible(),false,'Inactive pagination remains hidden without JavaScript');
  assert.deepEqual(await staticPage.locator('[data-case-tab]:visible').evaluateAll(items=>items.map(item=>item.getAttribute('href').slice(1))),ids,'Every photo card is a native link without JavaScript');
  assert.deepEqual(await staticPage.locator('[data-case-panel]:visible').evaluateAll(items=>items.map(item=>item.id)),ids,'All reviewed galleries remain available without JavaScript');
  assert.equal(await staticPage.locator('.case-thumb[href]').count(),521);
  const href=await staticPage.locator('#'+ids.at(-1)+' .case-cover').getAttribute('href');
  const response=await nojs.request.get(new URL(href,gallery).href);assert.ok(response.ok());assert.match(response.headers()['content-type'],/^image\//);
  await staticPage.locator('[data-case-tab][href="#'+ids.at(-1)+'"]').click();assert.equal(new URL(staticPage.url()).hash,'#'+ids.at(-1));
  assert.equal(await staticPage.locator('#'+ids.at(-1)).isVisible(),true,'Native card links reach their static article');
  assert.equal(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await nojs.close();

  await page.goto(home);
  const preview=page.locator('#cases');
  assert.equal(await preview.count(),1,'Home keeps its compact case introduction');
  assert.equal(await page.locator('[data-case-tab], [data-case-panel], #case-viewer, #case-detail').count(),0,'The full library lives on Cases');
  const previewLinks=preview.locator('a[href^="cases.html#case-"]').filter({has:page.locator('img')});
  assert.deepEqual(await previewLinks.evaluateAll(links=>links.map(link=>link.getAttribute('href'))),['cases.html#case-01','cases.html#case-03','cases.html#case-04'],'Home preserves its reviewed destinations');
  assert.equal(await preview.getByRole('link',{name:/View all cases/i}).getAttribute('href'),'cases.html');
  for(const href of ['cases.html#case-01','cases.html#case-03','cases.html#case-04']){
   await page.locator('#cases a[href="'+href+'"]').click();await expectCase(href.split('#')[1]);await page.goto(home);
  }
  assert.deepEqual(errors,[]);
  fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/cases-accessibility.json',JSON.stringify(axeResults,null,2));
  console.log(`PASS independently reviewed ${ids.length}-case / 521-image library, photo cards and pagination, filters/search, native links and history, nested dialogs/focus, every asset decode, responsive/no-JS/motion and accessibility`);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
