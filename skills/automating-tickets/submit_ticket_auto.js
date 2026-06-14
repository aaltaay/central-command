const fs = require('fs');

// ==========================================
// CONFIGURATION
// ==========================================
// Replace this with your 2Captcha API key
const TWOCAPTCHA_API_KEY = '07f55d2283cc1a47b9fc4be9aea669da'; 

const SITE_KEY = '6LfoywErAAAAAMPkw4domNz-msdKJ1EBZ1KS5_Xe';
const PAGE_URL = 'https://ninegear.to/tickets/2-new-ticket?id_ticket=1846';
const SESSION_COOKIE = 'def50200256f7fef033b6eebffa6d7bacfaf1860e5e63198d469a3f401156d96a6af0795926fb0fa14c0754279c49d8d16b02cdd26798616cfcde69d3d6b02deb549e154dc53216037db6df7aa1a855a7c3572a2f7bbe5f648d0d04698c4235f2217bd5d37498954b2303d7a0d42b33104b919c7871c6b36874973455da09384ab2ec08445a74923b4011dba2e89c2f3dd6dd18876e52e6d3c190d32ec1f2e401dac13ee72fe6ab48078848aaac35a9384441db079952be62ea0b992b8c4201db63966cfe8fd1dce087daf7863c1e63c4e045fb5451f6328dbeba4231483256e9f9418c94707bbaa0f1fec876e79c9e970a545ef2f7a250f57d78ba93a0acd4b36b85d8a2445d46b818940b7b1820d30b6201e7397848f0dcbb3053264a6ab36b4942a4a6543a483ed7ac6a926141072e64ca240f1a88516d73c413536bd0c83e185d0270b1fc498e6682ddfee7dfe50cee5929c7a63fbf59f7dbeccd9b2e951e7274fb96462a9d9f3b7bf514adbf8bf1a2954171e0db1c36568b07696430a1e5b74757ec386751286050ed0b43d0fc801cffbce0c809f44335e9db5702a7b2029faa9b271ac7c341ca1b12b7756b78ada48a4acb50a88fe6391bc03ed222e4521ce725cc6c122243100ac7cd6795eb5750c6bc56ef211a4957c7fdfc3a4581108fd9f15baaa281c3443c3b06ff915f82bd761933077db43304979feea0c65566c32d8b430784840e902ff0fec80e9409b35c4011a7de9a6b68727068ad577581ec6b9094c42237dc5e1e6d265df95becd710abe72b0679e8ad1f9aff2bcd4349f73a702b941ae3061aeb7bd8c0766199120830faa16baa450494833efcd11045c';
const FULL_COOKIE = `PrestaShop-7a627346ffd9a0d2a487b9c507e59655=${SESSION_COOKIE}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function solveCaptcha() {
  console.log('1. Sending captcha to 2Captcha for solving...');
  
  const payload = {
    clientKey: TWOCAPTCHA_API_KEY,
    task: {
      type: "RecaptchaV2TaskProxyless",
      websiteURL: PAGE_URL,
      websiteKey: SITE_KEY,
      isInvisible: false
    }
  };

  const inResponse = await fetch('https://api.2captcha.com/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const inData = await inResponse.json();

  if (inData.errorId !== 0) {
    throw new Error(`2Captcha Create Task Error: ${inData.errorDescription || inData.errorCode}`);
  }

  const taskId = inData.taskId;
  console.log(`Captcha submitted successfully. Task ID: ${taskId}`);
  console.log('2. Waiting for token (this usually takes 15-45 seconds)...');

  // Poll for the result
  while (true) {
    await sleep(5000); // Wait 5 seconds between checks
    
    const resResponse = await fetch('https://api.2captcha.com/getTaskResult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientKey: TWOCAPTCHA_API_KEY,
        taskId: taskId
      })
    });
    
    const resData = await resResponse.json();

    if (resData.errorId !== 0) {
       throw new Error(`2Captcha Get Result Error: ${resData.errorDescription || resData.errorCode}`);
    }

    if (resData.status === "ready") {
      console.log('\nCaptcha solved successfully!');
      return resData.solution.gRecaptchaResponse; 
    }
    
    process.stdout.write('.');
  }
}

async function submitTicket(captchaToken) {
  console.log('3. Submitting ticket to Ninegear with valid captcha token...');

  const formData = new FormData();
  formData.append('submit_send_ticket', '2');
  formData.append('fields[5]', 'Ahmed Altaay');
  formData.append('fields[6]', 'aaltaay2@gmail.com');
  formData.append('fields[7]', 'Urgent: Order PYRLTKUDO Non-Delivery & Refund Request');
  formData.append('fields[11]', 'PYRLTKUDO');
  formData.append('fields[10]', `My order was placed in early March, and today is May 20. After several tickets and repeated attempts to get a clear answer, I still have not received a valid tracking number, the products I paid for, or a refund.

I previously trusted your company. I ordered from you before, referred friends to you, and gave you the benefit of the doubt. Unfortunately, this experience has completely changed that.

At this point, the issue is very simple: I paid for an order, and after more than two months, there is still no proof of shipment, no delivery, no refund, and no proper resolution.

We will be leaving several factual public reviews on every relevant review website explaining exactly what happened: the order date, the lack of tracking, the lack of delivery, the lack of refund, and the lack of proper communication.

This is not a threat. This is a factual record of my customer experience.

If you want to resolve this before those reviews are posted, send either a valid tracking number or a full refund.`);
  formData.append('submit_send_ticket_2', '1');
  
  // Simulate an empty file upload using an empty File with a valid extension
  formData.append('fields[9]', new File([], 'empty.png', { type: 'image/png' }));

  formData.append('g-recaptcha-response', captchaToken);

  const response = await fetch(PAGE_URL, {
    method: 'POST',
    headers: {
      'Cookie': FULL_COOKIE,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    },
    body: formData
  });

  const text = await response.text();
  
  if (text.includes('reCAPTCHA is invalid')) {
    console.error('FAILED: Server rejected the CAPTCHA token.');
  } else if (text.includes('Your message has been successfully sent') || text.includes('success')) {
    console.log('SUCCESS: Ticket was successfully submitted!');
  } else {
    // Save to file for manual inspection if it's ambiguous
    fs.writeFileSync('auto_post_response.html', text);
    console.log('Ticket submitted. Please check auto_post_response.html to verify success.');
  }
}

async function main() {
  if (TWOCAPTCHA_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('ERROR: You must provide a 2Captcha API key in the script configuration.');
    process.exit(1);
  }

  try {
    const token = await solveCaptcha();
    await submitTicket(token);
  } catch (error) {
    console.error(`\nAutomation Failed: ${error.message}`);
  }
}

main();
