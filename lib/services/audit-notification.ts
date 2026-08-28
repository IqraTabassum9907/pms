// Mock implementations — no database needed on Vercel

export async function createAuditLog({
  userEmail,
  userName,
  userRole,
  action,
  entity,
  entityId,
  previousStatus,
  newStatus,
  details,
}: {
  userEmail: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: string | null;
}) {
  // No-op in mock mode — log to console only
  console.log(`[AUDIT] ${userName} (${userRole}) — ${action} on ${entity}:${entityId} [${previousStatus} → ${newStatus}]`);
  return { id: `al-${Date.now()}`, userEmail, userName, userRole, action, entity, entityId, previousStatus, newStatus, details, createdAt: new Date().toISOString() };
}

export async function createNotification({
  title,
  message,
  type = "INFO",
  recipientRole,
  linkUrl,
}: {
  title: string;
  message: string;
  type?: "INFO" | "WARNING" | "URGENT" | "SUCCESS";
  recipientRole?: string;
  linkUrl?: string;
}) {
  // No-op in mock mode — log to console only
  console.log(`[NOTIFICATION] [${type}] ${title}: ${message}`);
  return { id: `n-${Date.now()}`, title, message, type, recipientRole, linkUrl, isRead: false, createdAt: new Date().toISOString() };
}
