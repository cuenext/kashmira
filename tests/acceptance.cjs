const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const base = process.env.SITE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base+'contact.html');
  assert.equal(await page.locator('#booking-form').count(),1,'Contact must offer an appointment inquiry');
  await page.locator('#booking-name').fill('Sam & family');
  await page.locator('#booking-location').selectOption({label:'Abu Dhabi · Al Raha'});
  const popupPromise=page.waitForEvent('popup');
  await page.getByRole('button',{name:'Continue on WhatsApp'}).click();
  const popup=await popupPromise;
  await popup.waitForLoadState('domcontentloaded').catch(()=>{});
  const url=popup.url();
  assert.match(url,/wa.me|whatsapp.com/,'Booking should open WhatsApp');
  const message=new URL(url).searchParams.get('text');
  assert.match(message,/Sam & family/,'Name must survive message encoding');
  assert.match(message,/Al Raha/,'Selected location must be included');
  await popup.close();
  await page.goto(base);
  const menu=page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  assert.equal(await menu.evaluate(el=>document.activeElement===el),true,'Escape must return menu focus');
  for (const file of ['', 'about.html','contact.html']) {
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+file);
      assert.equal(await page.locator('h1').count(),1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' must fit '+width);
    }
  }
  await browser.close();
  console.log('PASS appointment inquiry, mobile menu Escape/focus and 15 page/breakpoint checks');
})().catch(e=>{console.error(e);process.exit(1)});
