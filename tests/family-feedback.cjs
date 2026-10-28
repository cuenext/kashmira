const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.SITE_URL || 'http://127.0.0.1:4173/';
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    for (const file of ['index.html','about.html','cases.html','contact.html']) {
      await page.goto(base + file);
      const text = await page.locator('body').innerText();
      const html = await page.content();
      assert.equal(html.includes('+971505679198'), false, file + ' must not expose a personal phone');
      assert.equal(html.includes('wa.me/'), false, file + ' must not link to a personal WhatsApp');
      assert.equal(await page.locator('a.language-link[href="arabic.html"]').count(), 1, file + ' has an Arabic language switch');
      assert.equal(await page.locator('link[href*="feedback.css"]').count(), 1, file + ' loads family feedback styles');
      assert.equal(await page.locator('a[href="index.html#reviews"]').count() >= 1, true, file + ' links to patient experiences');
      assert.equal(text.includes('Launch rocket'), false);
    }
    await page.goto(base + 'index.html');
    assert.match(await page.locator('.hero h1').innerText(), /Big feelings[.]\s*Little smiles[.]\s*A safe space for both[.]/);
    assert.equal(await page.locator('.hero-portrait img').getAttribute('src'), 'assets/photos/kashmira-about-1200.webp');
    assert.equal(await page.locator('#star-mission').count(), 0);
    assert.equal(await page.locator('.rocket-launch').count(), 0);
    assert.equal(await page.locator('#reviews .family-proof-card').count(), 2);
    assert.equal(await page.locator('#reviews a[href*="google.com/search"]').count(), 1);
    assert.equal(await page.locator('#sedation').count(), 1);
    assert.match(await page.locator('#care').innerText(), /autism and ADHD/);
    await page.goto(base + 'about.html');
    assert.match(await page.locator('#approach').innerText(), /autism and ADHD/);
    await page.goto(base + 'contact.html');
    assert.equal(await page.locator('a[href^="tel:"]:not([href="tel:998"])').count(), 0);
    assert.equal(await page.locator('#booking-form button').innerText(), 'Open email draft');
    await page.goto(base + 'cases.html');
    const sort = page.locator('#case-sort');
    assert.equal(await sort.count(), 1);
    await sort.selectOption('name');
    const names = await page.locator('.case-card:visible .case-card-copy strong').allTextContents();
    const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
    assert.deepEqual(names, [...names].sort(collator.compare));
    await sort.selectOption('category');
    const categories = await page.locator('.case-card:visible').evaluateAll(cards => cards.map(card => card.dataset.categoryLabel));
    assert.deepEqual(categories, [...categories].sort(collator.compare));
    await page.getByRole('button', { name: /Clear filters/i }).click();
    assert.equal(await sort.inputValue(), 'featured');
    await page.goto(base + 'arabic.html');
    assert.equal(await page.locator('html').getAttribute('lang'), 'ar');
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    assert.match(await page.locator('.arabic-hero h1').innerText(), /ابتسامات صغيرة/);
    assert.equal(await page.locator('.arabic-header nav a[href="index.html"]').count(), 1);
    assert.equal(await page.locator('a[href^="mailto:"]').count() >= 2, true);
    assert.equal(await page.locator('a[href^="tel:"]').count(), 0);
    console.log('PASS family feedback: new headline/photo, no personal phone, email, patient experiences, sedation, case sort, Arabic');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
