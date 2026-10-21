const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/case-review.json'),'utf8'));
const practices=[
 {name:'Dr. Munir Silwadi Dental Centre',address:'Al Raha Mall, Abu Dhabi'},
 {name:'Dr. Sai Ganesh Medical Centre',address:'Al Karama, Dubai'},
 {name:'Bay Avenue Dental Centre',address:'Business Bay, Dubai'},
 {name:'Hellenic Dental Clinic',address:'Al Wasl Road, Al Bada’a, Dubai'}
];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('**/assets/app.js*',route=>route.abort());
  for(const file of ['index.html','about.html','contact.html','cases.html']){
   await page.goto(base+file);
   assert.equal(await page.locator('#site-nav').isVisible(),true,file+' navigation remains usable when script download fails');
   assert.equal(await page.locator('#site-nav a[href="cases.html"]').count(),1,'Navigation still links to the dedicated cases page');
  }
  assert.deepEqual(await page.locator('[data-case-panel]:visible').evaluateAll(items=>items.map(item=>item.id)),review.cases.map(item=>item.id),'Every independently reviewed gallery remains available if enhancement fails');
  assert.deepEqual(await page.locator('.case-grid [data-case-tab]:visible').evaluateAll(items=>items.map(item=>item.getAttribute('href').slice(1))),review.cases.map(item=>item.id),'Every photo preview remains a usable native link if enhancement fails');
  assert.equal(await page.locator('.case-grid [data-case-tab] img').count(),87,'All reviewed photo previews survive an interrupted script');
  assert.equal(await page.locator('.case-thumb[href]').count(),review.cases.reduce((total,item)=>total+item.imageCount,0),'Every reviewed image retains its direct link');
  assert.equal(await page.locator('.case-filters').isVisible(),false,'An interrupted script cannot expose inoperative search controls');
  assert.equal(await page.locator('#case-load-more').isVisible(),false,'An interrupted script cannot expose inoperative pagination');
  assert.equal(await page.locator('#case-detail').isVisible(),false,'An interrupted script leaves native case articles accessible');
  await page.locator('[data-case-tab][href="#'+review.cases.at(-1).id+'"]').click();
  assert.equal(new URL(page.url()).hash,'#'+review.cases.at(-1).id,'A photo preview still reaches its native case article');
  for(const [id,count] of [['case-01',4],['case-02',2],['case-03',2],['case-04',4],['case-05',4]])assert.equal(await page.locator('#'+id+' .case-thumb[href]').count(),count,'Original gallery '+id+' survives script failure');
  await page.goto(base+'contact.html');
  assert.equal(await page.locator('#booking-form button').isDisabled(),true,'Failed script cannot submit a personal-data GET');
  assert.equal(await page.locator('#booking-form [name]').count(),0,'Inquiry controls must not leak data through default form submission');
  const location=page.locator('#booking-form select#booking-location');
  assert.equal(await location.count(),1,'The native current-clinic selector survives an interrupted script');
  assert.equal(await location.inputValue(),'','A failed script does not default the inquiry to a clinic');
  assert.deepEqual(await location.locator('option').evaluateAll(options=>options.map(option=>option.value)),['','silwadi','sai-ganesh','bay-avenue','hellenic'],'Failed-script booking retains the four current choices and a neutral option');
  const cards=page.locator('#locations .location-list article');
  assert.equal(await cards.count(),4,'All four current locations remain accessible when the script fails');
  for(const practice of practices){
   const card=cards.filter({hasText:practice.name});
   assert.equal(await card.count(),1,'Failed-script Contact identifies '+practice.name);
   assert.equal(await card.isVisible(),true,'Failed-script Contact exposes '+practice.name);
   assert.ok((await card.innerText()).includes(practice.address),'Failed-script Contact shows the correct address and city for '+practice.name);
  }
  assert.equal(await page.getByRole('link',{name:'Open WhatsApp to ask about an appointment ↗'}).isVisible(),true);
  console.log('PASS four-page interrupted-script navigation, static cases, and private four-clinic booking fallback');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
