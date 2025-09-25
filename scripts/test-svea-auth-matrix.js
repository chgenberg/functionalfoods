const { createHash } = require('crypto');

function pad(n){return String(n).padStart(2,'0');}
function tsUTC(d=new Date()){return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`}
function tsLocal(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`}

function auth(merchantId, secretWord, method, body, ts){
  if(method==='GET') body='';
  const raw = [body||'', secretWord, ts].join('');
  const hash = createHash('sha512').update(raw, 'utf8').digest('hex');
  const j = `${merchantId}:${hash}`;
  return `Svea ${Buffer.from(j,'utf8').toString('base64')}`;
}

(async ()=>{
  const merchantId = process.env.SVEA_MERCHANT_ID;
  const secretWord = process.env.SVEA_SECRET_WORD;
  const baseUrl = 'https://checkoutapistage.svea.com';
  if(!merchantId||!secretWord){ console.error('Missing env'); process.exit(1); }

  const bodyObj={
    countryCode:'SE',currency:'SEK',locale:'sv-SE',clientOrderNumber:`FF-TEST-${Date.now()}`,
    merchantSettings:{
      termsUri: process.env.NEXT_PUBLIC_SITE_URL || 'https://functionalfoods.se/anvandarvillkor',
      checkoutUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout` : 'https://functionalfoods.se/checkout',
      confirmationUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success/svea-v2` : 'https://functionalfoods.se/checkout/success/svea-v2',
      pushUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/svea-v2/webhook` : 'https://functionalfoods.se/api/checkout/svea-v2/webhook'
    },
    cart:{ items:[{articleNumber:'functional-energy',name:'Functional Energy (TEST)',quantity:1,unitPrice:229500,vatPercent:0,unit:'st'}] }
  };
  const body = JSON.stringify(bodyObj);

  const variants = [];
  const now=new Date();
  variants.push(['UTC now', tsUTC(now)]);
  const minus1=new Date(now.getTime()-60000); variants.push(['UTC -1m', tsUTC(minus1)]);
  const localNow=new Date(); variants.push(['LOCAL now', tsLocal(localNow)]);
  const localMinus1=new Date(localNow.getTime()-60000); variants.push(['LOCAL -1m', tsLocal(localMinus1)]);

  for(const [label, ts] of variants){
    const Authorization = auth(merchantId, secretWord, 'POST', body, ts);
    console.log(`\n=== Attempt: ${label} | Timestamp: ${ts}`);
    const res = await fetch(`${baseUrl}/api/orders`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':Authorization,'Timestamp':ts}, body });
    const text = await res.text();
    console.log('Status:', res.status, res.statusText);
    console.log('Head:', text.slice(0,300));
    if(res.ok){
      console.log('SUCCESS');
      break;
    }
  }
})();
