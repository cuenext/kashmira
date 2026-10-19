const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.SITE_URL||'http://127.0.0.1:4173/';
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
  assert.equal(await page.locator('[data-case-panel]:visible').count(),5,'All case galleries remain available if their enhancement fails');
  assert.equal(await page.locator('.case-thumb[href]').count(),16,'Every reviewed photograph retains its direct link');
  await page.goto(base+'contact.html');
  assert.equal(await page.locator('#booking-form button').isDisabled(),true,'Failed script cannot submit a personal-data GET');
  assert.equal(await page.locator('#booking-form [name]').count(),0,'Inquiry controls must not leak data through default form submission');
  assert.equal(await page.locator('#booking-form select').count(),0,'A failed script cannot expose former workplaces as booking choices');
  assert.match(await page.locator('#booking-form').innerText(),/Silwadi/i,'The fixed current practice remains clear without the script');
  assert.equal(await page.getByRole('link',{name:'Open WhatsApp to ask about an appointment ↗'}).isVisible(),true);
  console.log('PASS four-page interrupted-script navigation, static cases, and private fixed-practice booking fallback');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
