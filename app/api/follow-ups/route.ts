import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/services/audit-notification";

export async function GET() {
  try {
    const followUps = await prisma.followUp.findMany({
      orderBy: { createdAt: "desc" },
      include: { po: { include: { vendor: true } }, vendor: true },
    });
    return NextResponse.json(followUps);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { poId, vendorId, remarks, actionTaken, nextFollowUpDate, status, userName, userEmail, userRole } = body;

    const followUp = await prisma.followUp.create({
      data: {
        poId,
        vendorId,
        followUpDate: new Date(),
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
        daysPending: 2,
        status: status || "IN_PROGRESS",
        remarks: remarks || "Followed up with vendor regarding expected delivery schedule.",
        actionTaken: actionTaken || "CALL",
        createdByName: userName || "Amit Patel",
      },
      include: { po: true, vendor: true },
    });

    await createAuditLog({
      userEmail: userEmail || "executive@purchaseflow.com",
      userName: userName || "Amit Patel",
      userRole: userRole || "PURCHASE_EXECUTIVE",
      action: "Recorded Vendor Follow-Up",
      entity: "FollowUp",
      entityId: followUp.po.poNo,
      previousStatus: "PENDING",
      newStatus: followUp.status,
      details: `Action: ${followUp.actionTaken}. ${followUp.remarks}`,
    });

    return NextResponse.json(followUp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record follow-up" }, { status: 500 });
  }
}
