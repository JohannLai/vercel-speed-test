const { findFastestIP } = require("./ipTester");
const config = require("../config");
const cron = require("node-cron");
const fs = require("fs").promises;

async function runTest() {
  try {
    console.log("Starting IP speed test...");

    const fastestIP = await findFastestIP(
      config.TEST_IPS,
      config.TEST_URL,
      config.TEST_COUNT
    );

    console.log(`Fastest IP overall: ${fastestIP.ip}`);
    console.log(
      `Average Response Time: ${fastestIP.avgResponseTime.toFixed(2)}ms`
    );
    console.log(`Success Rate: ${(fastestIP.successRate * 100).toFixed(2)}%`);

    // 将结果写入文件
    const result = {
      timestamp: new Date().toISOString(),
      fastestIP: fastestIP.ip,
      avgResponseTime: fastestIP.avgResponseTime,
      successRate: fastestIP.successRate,
    };

    await fs.appendFile(config.RESULTS_FILE, JSON.stringify(result) + "\n");

    console.log(`Test results saved to ${config.RESULTS_FILE}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// 立即运行一次测试
runTest();

// 设置定时任务
cron.schedule(config.CRON_SCHEDULE, () => {
  console.log("Running scheduled test");
  runTest();
});

console.log(`Speed test scheduled to run at: ${config.CRON_SCHEDULE}`);
