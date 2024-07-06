require("dotenv").config();

module.exports = {
  TEST_IPS: (process.env.TEST_IPS || "").split(",").filter((ip) => ip.trim()),
  TEST_URL: process.env.TEST_URL || "https://ielts9.me",
  TEST_INTERVAL: parseInt(process.env.TEST_INTERVAL) || 3600000, // 1 hour
  TEST_COUNT: parseInt(process.env.TEST_COUNT) || 5,
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || "0 */1 * * *", // Every hour by default
  RESULTS_FILE: process.env.RESULTS_FILE || "test_results.json",
};
