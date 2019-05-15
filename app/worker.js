const CronJob = require("cron").CronJob;
const Cron = require("./cron");

new CronJob(
  "0 4 * * *",
  function() {
    // Cron.run();
    console.log("Running...");
  },
  null,
  true,
  "Europe/Helsinki"
);
