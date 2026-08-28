import { prisma } from "@/lib/db/prisma";

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
  try {
    return await prisma.auditLog.create({
      data: {
        userEmail,
        userName,
        userRole,
        action,
        entity,
        entityId,
        previousStatus,
        newStatus,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
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
  try {
    return await prisma.notification.create({
      data: {
        title,
        message,
        type,
        recipientRole,
        linkUrl,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
