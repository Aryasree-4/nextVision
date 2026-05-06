const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen for console and network errors
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  page.on('response', response => {
    if(!response.ok()) {
      console.log('RESPONSE FAILED:', response.url(), response.status());
      response.text().then(text => console.log('RESPONSE BODY:', text)).catch(() => {});
    }
  });

  try {
    await page.goto('http://localhost:5173/login');
    // Login
    await page.type('#email', 'admin@nv.com');
    await page.type('#password', 'password123'); // Try default password
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Go to create course
    await page.goto('http://localhost:5173/admin/create-course');
    await page.waitForSelector('#course_title');

    // Fill form
    await page.type('#course_title', 'Simulation Singularity Studies');
    await page.type('textarea', 'Introduction to Simulation Singularity');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait a bit to see network requests
    await new Promise(r => setTimeout(r, 2000));
    
  } catch (error) {
    console.error('PUPPETEER ERROR:', error);
  } finally {
    await browser.close();
  }
})();
