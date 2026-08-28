export interface TATRule {
  days: number;
  hours: number;
  minutes: number;
}

export const DEFAULT_TAT_RULES: Record<string, TATRule> = {
  INDENT_APPROVAL: { days: 1, hours: 0, minutes: 0 },
  QUOTATION: { days: 2, hours: 0, minutes: 0 },
  VENDOR_SELECTION: { days: 1, hours: 0, minutes: 0 },
  PO_APPROVAL: { days: 1, hours: 0, minutes: 0 },
  PO_DISPATCH: { days: 0, hours: 4, minutes: 0 },
  FOLLOW_UP: { days: 2, hours: 0, minutes: 0 },
  PAYMENT: { days: 3, hours: 0, minutes: 0 },
  LOGISTICS: { days: 1, hours: 0, minutes: 0 },
  MATERIAL_RECEIPT: { days: 2, hours: 0, minutes: 0 },
};

export function calculatePlannedDate(startDate: Date, ruleKey: string, customRule?: TATRule): Date {
  const rule = customRule || DEFAULT_TAT_RULES[ruleKey] || { days: 1, hours: 0, minutes: 0 };
  const planned = new Date(startDate.getTime());
  planned.setDate(planned.getDate() + rule.days);
  planned.setHours(planned.getHours() + rule.hours);
  planned.setMinutes(planned.getMinutes() + rule.minutes);
  return planned;
}

export function getTATStatus(plannedDate?: Date | null, actualDate?: Date | null): {
  status: "ON_TIME" | "DELAYED" | "IN_PROGRESS";
  label: string;
  daysPending: number;
} {
  if (!plannedDate) {
    return { status: "IN_PROGRESS", label: "In Progress", daysPending: 0 };
  }

  const now = new Date();
  const compareTarget = actualDate ? new Date(actualDate) : now;
  const isOverdue = compareTarget.getTime() > new Date(plannedDate).getTime();
  const diffTime = Math.abs(compareTarget.getTime() - new Date(plannedDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (actualDate) {
    if (isOverdue) {
      return { status: "DELAYED", label: `Delayed by ${diffDays} day(s)`, daysPending: diffDays };
    }
    return { status: "ON_TIME", label: "Completed On Time", daysPending: 0 };
  }

  if (isOverdue) {
    return { status: "DELAYED", label: `Overdue by ${diffDays} day(s)`, daysPending: diffDays };
  }

  return { status: "IN_PROGRESS", label: `${diffDays} day(s) remaining`, daysPending: diffDays };
}
