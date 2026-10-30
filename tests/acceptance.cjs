const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const practices = [
  {id:'silwadi',name:'Dr. Munir Silwadi Dental Centre',address:'Al Raha Mall, Abu Dhabi'},
  {id:'sai-ganesh',name:'Dr. Sai Ganesh Medical Centre',address:'Office 105, Crystal Business Centre, Al Karama, Dubai'},
  {id:'bay-avenue',name:'Bay Avenue Dental Centre',address:'Office 1701, The Regal Tower, Business Bay, Dubai'},
  {id:'hellenic',name:'Hellenic Dental Clinic',address:'Al Wasl Road, Al Bada’a, Dubai'}
];
(async () => {
  const browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  const base = process.env.SITE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base+'contact.html');
  assert.equal(await page.locator('#booking-form').count(),1,'Contact must offer an appointment inquiry');
  const location=page.locator('#booking-form select#booking-location');
  assert.equal(await location.count(),1,'Parents can choose among the four current practices');
  assert.deepEqual(await location.locator('option').evaluateAll(options=>options.map(option=>option.value)),['','silwadi','sai-ganesh','bay-avenue','hellenic'],'Booking offers a neutral choice and exactly the four confirmed current practices');
  assert.match(await location.locator('option[value=""]').textContent(),/help me choose/i,'The neutral choice is clearly explained');
  assert.equal(await location.inputValue(),'','Booking does not silently choose a clinic');
  for(const practice of practices)assert.ok((await location.locator(`option[value="${practice.id}"]`).textContent()).includes(practice.name),'Each booking choice identifies its clinic');
  const selection=page.locator('#booking-selected-clinic');
  assert.equal(await selection.count(),1,'Booking provides a readable selected-clinic summary below the native selector');
  assert.equal(await selection.isVisible(),false,'The summary starts hidden when no clinic is selected');
  assert.equal((await selection.textContent()).trim(),'','The initial neutral choice does not show a clinic summary');
  assert.equal(await selection.getAttribute('role'),'status','Clinic changes can be announced without moving focus');
  assert.equal(await selection.getAttribute('aria-live'),'polite','The selected-clinic summary announces changes politely');
  assert.equal(await page.locator('#booking-name').getAttribute('required'),null,'A name remains optional');
  assert.equal(await page.locator('#booking-form [name]').count(),0,'Unenhanced form controls cannot leak personal details through a native GET');
  // Check generated email drafts through their fallback links; no email is sent.
  async function chooseClinic(practiceId){
    await location.selectOption(practiceId);
    const practice=practices.find(item=>item.id===practiceId);
    if(practice){
      assert.equal(await selection.isVisible(),true,'Choosing '+practice.name+' immediately reveals its readable summary');
      const text=(await selection.textContent()).replace(/\s+/g,' ').trim();
      assert.equal(text,practice.name+' '+practice.address,'The summary shows the full chosen clinic name and address');
    }else{
      assert.equal(await selection.isVisible(),false,'Help me choose hides the previously selected clinic summary');
      assert.equal((await selection.textContent()).trim(),'','Help me choose clears the previously selected clinic summary');
    }
  }
  async function draft(practiceId,name){
    await chooseClinic(practiceId);
    await page.locator('#booking-name').fill(name);
    await page.getByRole('button',{name:'Open email draft'}).click();
    const href=await page.locator('.form-status a').getAttribute('href');
    const url=new URL(href);
    assert.equal(url.protocol,'mailto:','All enquiries use email without exposing a mobile number');
    assert.equal(url.pathname,'contact@drkashmira.com');
    assert.match(url.searchParams.get('subject'),/Appointment enquiry/);
    const message=url.searchParams.get('body');
    assert.ok(message,'Email contains an appointment enquiry draft');
    if(name)assert.ok(message.includes(name),'Names preserve Unicode and punctuation through message encoding');
    else assert.doesNotMatch(message,/Sam & family/,'An anonymous enquiry does not reuse a previous name');
    return message;
  }
  for(const name of ['Sam & family + عائلة','']){
    for(const practice of practices){
      const message=await draft(practice.id,name);
      assert.ok(message.includes(practice.name),practice.id+' inquiry identifies the selected clinic');
      assert.ok(message.includes(practice.address),practice.id+' inquiry includes its actual address and city');
      for(const other of practices.filter(item=>item.id!==practice.id)){
        assert.equal(message.includes(other.name),false,'An inquiry must not name an unchosen clinic');
        assert.equal(message.includes(other.address),false,'An inquiry must not include an unchosen clinic address');
      }
    }
    const neutral=await draft('',name);
    assert.match(neutral,/Abu Dhabi/i,'The neutral inquiry asks about Abu Dhabi');
    assert.match(neutral,/Dubai/i,'The neutral inquiry asks about Dubai');
    assert.match(neutral,/availab/i,'The neutral inquiry asks for availability');
    for(const practice of practices)assert.equal(neutral.includes(practice.name),false,'Help me choose must not default to any clinic');
    assert.doesNotMatch(neutral,/Al Raha Mall|Al Karama|Business Bay|Al Wasl Road|Al Bada[’']a/i,'Help me choose must not default to a clinic address');
  }
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    for(const practice of practices){
      await chooseClinic(practice.id);
      const layout=await selection.evaluate(element=>{
        const box=element.getBoundingClientRect();
        const form=element.closest('form').getBoundingClientRect();
        const style=getComputedStyle(element);
        const range=document.createRange();range.selectNodeContents(element);
        return {
          fitsForm:box.left>=form.left-1&&box.right<=form.right+1,
          fitsText:element.scrollWidth<=element.clientWidth+1&&element.scrollHeight<=element.clientHeight+1,
          ellipsis:style.textOverflow==='ellipsis',
          nowrap:style.whiteSpace==='nowrap',
          lines:new Set([...range.getClientRects()].map(rect=>Math.round(rect.top))).size
        };
      });
      assert.equal(layout.fitsForm,true,practice.id+' summary stays inside the booking form at '+width+'px');
      assert.equal(layout.fitsText,true,practice.id+' full summary text stays visible at '+width+'px');
      assert.equal(layout.ellipsis,false,practice.id+' summary does not ellipsize its clinic or city at '+width+'px');
      assert.equal(layout.nowrap,false,practice.id+' summary allows text to wrap at '+width+'px');
      assert.ok(layout.lines>=2,practice.id+' clinic name and address occupy readable lines at '+width+'px');
    }
    await chooseClinic('');
  }
  await page.goto(base);
  const menu=page.locator('.menu-toggle');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  assert.equal(await menu.evaluate(el=>document.activeElement===el),true,'Escape must return menu focus');
  // Landscape phones must keep the last navigation actions reachable.
  await page.setViewportSize({width:640,height:320});
  await menu.click();
  const navigation=page.locator('#site-nav');
  const menuBounds=await navigation.boundingBox();
  assert.ok(menuBounds.y+menuBounds.height<=320+1,'Open mobile menu must fit a short landscape viewport');
  const bookingLink=navigation.locator('.button');
  await bookingLink.focus();
  const bookingBounds=await bookingLink.boundingBox();
  assert.ok(bookingBounds.y>=menuBounds.y&&bookingBounds.y+bookingBounds.height<=320+1,'Keyboard users can reach the final booking action in landscape');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'),'false');
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'contact.html');
  await menu.click();
  const navLinkCount=await navigation.locator('a').count();
  for(let i=0;i<=navLinkCount;i++)await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>!!document.activeElement.closest('.site-header')),false,'Tab can leave the navigation disclosure');
  assert.equal(await menu.getAttribute('aria-expanded'),'false','Leaving the header by keyboard closes the menu so it cannot cover the next control');
  for (const file of ['', 'about.html','contact.html','cases.html']) {
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(base+file);
      assert.equal(await page.locator('h1').count(),1);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' must fit '+width);
    }
  }
  await browser.close();
  console.log('PASS four-clinic and neutral appointment drafts, readable mobile clinic summaries, optional names and encoding, mobile menu Escape/focus and 20 page/breakpoint checks');
})().catch(e=>{console.error(e);process.exit(1)});
