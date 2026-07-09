import deletionService from "../services/cleanup/deletion.service.ts";
import logger from "../config/log/logger.ts";

const run = async () => {
  try {
    logger.info("Starting deletion processor run");
    await deletionService.processPendingDeletions();
    logger.info("Deletion processor completed");
    process.exit(0);
  } catch (err) {
    logger.error("Deletion processor failed", err);
    process.exit(1);
  }
};

run();
