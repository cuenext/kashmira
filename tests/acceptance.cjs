const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const base = process.env.SITE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base+'contact.html');
  assert.equal(await page.locator('#booking-form').count(),1,'Contact must offer an appointment inquiry');
  assert.equal(await page.locator('#booking-form select, #booking-location').count(),0,'Booking has one fixed current practice rather than a location selector');
  assert.equal(await page.locator('#booking-name').getAttribute('required'),null,'A name remains optional');
  const fixedPractice=/Dr\.?\s*Munir\s+Silwadi\s+Dental\s+Centre/i;
  assert.match(await page.locator('#booking-form').innerText(),fixedPractice,'Booking clearly identifies the current practice');
  await page.locator('#booking-name').fill('Sam & family');
  // Verify the message draft without making an external WhatsApp request.
  await page.context().route(/^https:\/\/wa\.me\//,route=>route.fulfill({status:200,contentType:'text/html',body:'Appointment draft preview'}));
  const popupPromise=page.waitForEvent('popup');
  await page.getByRole('button',{name:'Continue on WhatsApp'}).click();
  const popup=await popupPromise;
  await popup.waitForLoadState('domcontentloaded').catch(()=>{});
  const url=popup.url();
  assert.match(url,/wa.me|whatsapp.com/,'Booking should open WhatsApp');
  const message=new URL(url).searchParams.get('text');
  assert.match(message,/Sam & family/,'Name must survive message encoding');
  assert.match(message,fixedPractice,'The current practice is included in the message');
  assert.match(message,/Al Raha Mall/i,'The mall is included in the fixed practice address');
  assert.match(message,/Abu Dhabi/i,'The city is included in the fixed practice address');
  assert.doesNotMatch(message,/Sai Ganesh|Bay Avenue|Hellenic|preferred area/i,'Previous workplaces are not offered for booking');
  await popup.close();
  await page.locator('#booking-name').fill('');
  const anonymousPromise=page.waitForEvent('popup');
  await page.getByRole('button',{name:'Continue on WhatsApp'}).click();
  const anonymous=await anonymousPromise;
  await anonymous.waitForLoadState('domcontentloaded');
  assert.match(new URL(anonymous.url()).searchParams.get('text'),fixedPractice,'An inquiry also works without a name');
  await anonymous.close();
  await page.goto(base);
  const menu=page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  assert.equal(await menu.evaluate(el=>document.activeElement===el),true,'Escape must return menu focus');
  for (const file of ['', 'about.html','contact.html','cases.html']) {
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+file);
      assert.equal(await page.locator('h1').count(),1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' must fit '+width);
    }
  }
  await browser.close();
  console.log('PASS optional-name fixed-practice appointment inquiry, mobile menu Escape/focus and 20 page/breakpoint checks');
})().catch(e=>{console.error(e);process.exit(1)});
