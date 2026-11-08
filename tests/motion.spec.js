import{test,expect}from'@playwright/test';import{inventory}from'../src/catalog.js';import{shoes}from'../src/data.js';import fs from'node:fs';import crypto from'node:crypto';
test('all ten turntables contain 36 different actual source angles',()=>{
 expect(shoes).toHaveLength(10);for(const p of shoes){const files=fs.readdirSync('public'+p.frameBase).filter(f=>f.endsWith('.jpg'));expect(files).toHaveLength(36);const hashes=files.map(f=>crypto.createHash('sha256').update(fs.readFileSync('public'+p.frameBase+'/'+f)).digest('hex'));expect(new Set(hashes).size).toBe(36)}
});
test('real logo reveals, scroll changes the photographed angle, and next product stays synchronized',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('#intro')).toHaveClass(/finished/);await page.waitForTimeout(850);
 await expect.poll(()=>page.evaluate(()=>window.__kicksScene?.loadedFrames)).toBe(36);await expect(page.locator('header .brand-logo')).toHaveAttribute('src','/assets/kicksbydan-logo.png');
 const original=await page.locator('#canvas canvas').screenshot();await page.evaluate(()=>scrollTo(0,innerHeight*.8));await expect.poll(()=>page.evaluate(()=>window.__kicksScene.frame)).toBeGreaterThan(8);expect((await page.locator('#canvas canvas').screenshot()).equals(original)).toBe(false);
 await page.locator('#shoe-1').scrollIntoViewIfNeeded();await expect.poll(()=>page.evaluate(()=>window.__kicksScene.index)).toBe(1);await expect(page.locator('#current-shoe')).toContainText('Dodgers');
 await expect(page.locator('#photos-1 .real-pair img')).toHaveAttribute('src','/assets/shoe_2214.jpg');
 await page.getByRole('button',{name:'Replay intro'}).click();await expect(page.locator('#intro')).not.toHaveClass(/finished/);await expect(page.locator('#intro')).toHaveClass(/finished/);expect(errors).toEqual([]);
});
test('all original listings and inquiry destinations are preserved, including replica disclosure',async({page})=>{
 await page.goto('/');await page.locator('#vault').scrollIntoViewIfNeeded();await expect(page.locator('.inventory-card')).toHaveCount(12);
 for(let i=0;i<inventory.length;i++){const c=page.locator('.inventory-card').nth(i);await expect(c.locator('h3')).toHaveText(inventory[i].name);await expect(c.locator('strong')).toHaveText(inventory[i].price)}
 await page.locator('[data-brand="kobe"]').click();await expect(page.locator('.inventory-card')).toHaveCount(5);await page.locator('[data-brand="all"]').click();await page.locator('#sort').selectOption('price-asc');await expect(page.locator('.inventory-card strong').first()).toHaveText('$80.00');
 await page.getByLabel('Search sneakers').fill('Grinch');await expect(page.locator('.inventory-card')).toHaveCount(1);await expect(page.locator('.inventory-card .condition')).toContainText('1:1 REPLICAS');
 await page.locator('.inventory-content [data-product]').click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.replica-note')).toContainText('not represented as an authentic');await expect(page.locator('.detail-email')).toHaveAttribute('href',/mailto:dangiovanniello1@gmail.com\?subject=.*Grinch/);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.getByLabel('Search sneakers').fill('Sabrina');await expect(page.locator('.inventory-card')).toHaveCount(1);await expect(page.locator('.inventory-card h3')).toHaveText('Nike By You Custom Sabrina 1');
});
test('mobile reduced motion holds a stable angle while the actual photos and navigation stay usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect.poll(()=>page.evaluate(()=>window.__kicksScene?.ready)).toBe(true);await expect(page.locator('#intro')).toHaveClass(/finished/);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await page.evaluate(()=>scrollTo(0,innerHeight*.6));await expect.poll(()=>page.evaluate(()=>window.__kicksScene.frame)).toBe(0);await page.locator('a[href="#photos-0"]').first().click();await expect(page.locator('#photos-0')).toBeInViewport();await expect(page.locator('#photos-0 .real-pair img')).toHaveAttribute('src',inventory[0].img);await page.screenshot({path:'/tmp/kicks-real-mobile.png'});
});
test('local inquiry does not pretend to send or erase entered information',async({page})=>{
 await page.goto('/');await page.locator('#trade').scrollIntoViewIfNeeded();const f=page.locator('#trade-form');await f.locator('[name=name]').fill('Test Customer');await f.locator('[name=contact]').fill('test@example.com');await f.locator('[name=shoe_model]').fill('Jordan 4 SB Navy');await f.getByRole('button',{name:'Submit inquiry'}).click();await expect(page.locator('#form-status')).toContainText('no inquiry was sent');await expect(f.locator('[name=name]')).toHaveValue('Test Customer');
});
test('a failed deployed form response keeps the inquiry and never reports success',async({page})=>{
 let succeeds=false;await page.route('http://storefront.test/**',async route=>{const request=route.request();if(request.method()==='POST'){await route.fulfill({status:succeeds?200:503,body:succeeds?'Submitted':'Unavailable'});return}const url=new URL(request.url());const response=await route.fetch({url:'http://127.0.0.1:5174'+url.pathname+url.search});await route.fulfill({response})});
 await page.goto('http://storefront.test/');await page.locator('#trade').scrollIntoViewIfNeeded();const f=page.locator('#trade-form');await f.locator('[name=name]').fill('Test Customer');await f.locator('[name=contact]').fill('test@example.com');await f.locator('[name=shoe_model]').fill('Jordan 4 SB Navy');await f.getByRole('button',{name:'Submit inquiry'}).click();await expect(page.locator('#form-status')).toContainText('could not be sent');await expect(f.locator('[name=name]')).toHaveValue('Test Customer');
 succeeds=true;await f.getByRole('button',{name:'Submit inquiry'}).click();await expect(page.locator('#form-status')).toContainText('Inquiry submitted');await expect(f.locator('[name=name]')).toHaveValue('');
});
