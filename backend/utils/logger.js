/**
 * Activity & Security Audit Logger
 */
export const logActivity = ({ action, userId, details = {}, ip = null }) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUDITLOG ${timestamp}] Action: ${action} | User: ${userId || "Anonymous"} | IP: ${ip || "N/A"} | Details:`, JSON.stringify(details));
};

export const logSecurityEvent = ({ event, userId, severity = "INFO", details = {} }) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITYLOG ${timestamp}] [${severity}] Event: ${event} | User: ${userId || "Anonymous"} | Details:`, JSON.stringify(details));
};
