import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TEMPLATE_PATH = 'file:///' + path.resolve('hogwarts_card_template.html').replace(/\\/g, '/');
const OUTPUT_PATH = path.resolve('hogwarts_card_render.png');

export async function renderHogwartsCard(counts = { slytherin: 3, gryffindor: 2, ravenclaw: 1, hufflepuff: 0 }) {
  console.log('🎨 Rendering Hogwarts Graphic Card via Chrome...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 960, deviceScaleFactor: 2 });
  await page.goto(TEMPLATE_PATH, { waitUntil: 'networkidle0' });

  // Dynamically update the counts & bars inside the DOM
  await page.evaluate((c) => {
    const total = Math.max(1, c.slytherin + c.gryffindor + c.ravenclaw + c.hufflepuff);

    // Slytherin
    const slytherinBox = document.querySelector('.house-box.slytherin');
    if (slytherinBox) {
      slytherinBox.querySelector('.count-badge strong').textContent = c.slytherin;
      slytherinBox.querySelector('.bar-fill').style.width = `${Math.max(5, (c.slytherin / total) * 100)}%`;
    }

    // Gryffindor
    const gryffindorBox = document.querySelector('.house-box.gryffindor');
    if (gryffindorBox) {
      gryffindorBox.querySelector('.count-badge strong').textContent = c.gryffindor;
      gryffindorBox.querySelector('.bar-fill').style.width = `${Math.max(5, (c.gryffindor / total) * 100)}%`;
    }

    // Ravenclaw
    const ravenclawBox = document.querySelector('.house-box.ravenclaw');
    if (ravenclawBox) {
      ravenclawBox.querySelector('.count-badge strong').textContent = c.ravenclaw;
      ravenclawBox.querySelector('.bar-fill').style.width = `${Math.max(5, (c.ravenclaw / total) * 100)}%`;
    }

    // Hufflepuff
    const hufflepuffBox = document.querySelector('.house-box.hufflepuff');
    if (hufflepuffBox) {
      hufflepuffBox.querySelector('.count-badge strong').textContent = c.hufflepuff;
      hufflepuffBox.querySelector('.bar-fill').style.width = `${Math.max(5, (c.hufflepuff / total) * 100)}%`;
    }
  }, counts);

  await page.screenshot({ path: OUTPUT_PATH, type: 'png' });
  await browser.close();

  console.log(`✅ Graphic Card rendered successfully to: ${OUTPUT_PATH}`);
  return OUTPUT_PATH;
}

if (process.argv[1].endsWith('render_card.mjs')) {
  renderHogwartsCard().catch(console.error);
}
