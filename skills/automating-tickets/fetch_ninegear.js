const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'ninegear.to',
  port: 443,
  path: '/tickets/2-new-ticket?id_ticket=1846',
  method: 'GET',
  headers: {
    'Cookie': 'PrestaShop-7a627346ffd9a0d2a487b9c507e59655=def50200256f7fef033b6eebffa6d7bacfaf1860e5e63198d469a3f401156d96a6af0795926fb0fa14c0754279c49d8d16b02cdd26798616cfcde69d3d6b02deb549e154dc53216037db6df7aa1a855a7c3572a2f7bbe5f648d0d04698c4235f2217bd5d37498954b2303d7a0d42b33104b919c7871c6b36874973455da09384ab2ec08445a74923b4011dba2e89c2f3dd6dd18876e52e6d3c190d32ec1f2e401dac13ee72fe6ab48078848aaac35a9384441db079952be62ea0b992b8c4201db63966cfe8fd1dce087daf7863c1e63c4e045fb5451f6328dbeba4231483256e9f9418c94707bbaa0f1fec876e79c9e970a545ef2f7a250f57d78ba93a0acd4b36b85d8a2445d46b818940b7b1820d30b6201e7397848f0dcbb3053264a6ab36b4942a4a6543a483ed7ac6a926141072e64ca240f1a88516d73c413536bd0c83e185d0270b1fc498e6682ddfee7dfe50cee5929c7a63fbf59f7dbeccd9b2e951e7274fb96462a9d9f3b7bf514adbf8bf1a2954171e0db1c36568b07696430a1e5b74757ec386751286050ed0b43d0fc801cffbce0c809f44335e9db5702a7b2029faa9b271ac7c341ca1b12b7756b78ada48a4acb50a88fe6391bc03ed222e4521ce725cc6c122243100ac7cd6795eb5750c6bc56ef211a4957c7fdfc3a4581108fd9f15baaa281c3443c3b06ff915f82bd761933077db43304979feea0c65566c32d8b430784840e902ff0fec80e9409b35c4011a7de9a6b68727068ad577581ec6b9094c42237dc5e1e6d265df95becd710abe72b0679e8ad1f9aff2bcd4349f73a702b941ae3061aeb7bd8c0766199120830faa16baa450494833efcd11045c'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('response.html', data);
    console.log('Saved to response.html');
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
