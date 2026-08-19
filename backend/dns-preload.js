const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('◇ [DNS Preload] Overrode DNS servers to Google & Cloudflare.');
