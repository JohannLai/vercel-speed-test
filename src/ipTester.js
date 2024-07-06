const axios = require("axios");
const dns = require("dns").promises;

async function getVercelIPs() {
  try {
    const vercelCNAME = "cname.vercel-dns.com";
    const addresses = await dns.resolve4(vercelCNAME);
    console.log(`Found ${addresses.length} Vercel IPs:`, addresses);
    return addresses;
  } catch (error) {
    console.error("Error fetching Vercel IPs:", error);
    return [];
  }
}

async function testIP(ip, url, testCount) {
  let totalResponseTime = 0;
  let successfulTests = 0;

  const originalLookup = dns.lookup;
  dns.lookup = (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    callback(null, ip, 4);
  };

  const instance = axios.create({
    timeout: 5000,
    validateStatus: () => true,
  });

  for (let i = 0; i < testCount; i++) {
    const startTime = Date.now();
    try {
      await instance.get(url);
      const endTime = Date.now();
      totalResponseTime += endTime - startTime;
      successfulTests++;
    } catch (error) {
      console.error(`Error testing IP ${ip}:`, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
  }

  dns.lookup = originalLookup;

  const avgResponseTime =
    successfulTests > 0 ? totalResponseTime / successfulTests : Infinity;
  return { ip, avgResponseTime, successRate: successfulTests / testCount };
}

async function findFastestIP(ips, testUrl, testCount) {
  const vercelIPs = await getVercelIPs();
  console.log(`Found ${vercelIPs.length} Vercel IPs:`, vercelIPs);

  const allIPs = [...new Set([...ips, ...vercelIPs])]; // 合并并去重

  console.log(`Testing ${allIPs.length} IPs in total`);

  const results = await Promise.all(
    allIPs.map((ip) => testIP(ip, testUrl, testCount))
  );
  results.sort((a, b) => a.avgResponseTime - b.avgResponseTime);

  // 输出所有 IP 的测试结果
  results.forEach((result, index) => {
    console.log(
      `${index + 1}. IP: ${
        result.ip
      }, Avg Response Time: ${result.avgResponseTime.toFixed(
        2
      )}ms, Success Rate: ${(result.successRate * 100).toFixed(2)}%`
    );
  });

  return results[0];
}

module.exports = { testIP, findFastestIP, getVercelIPs };
