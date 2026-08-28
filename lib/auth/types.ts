export type UserRole =
  | "ADMIN"
  | "PURCHASE_MANAGER"
  | "PURCHASE_EXECUTIVE"
  | "ACCOUNTS"
  | "STORE_MANAGER"
  | "DEPARTMENT_HEAD";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  avatar?: string | null;
  phone?: string | null;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ["*"],
  PURCHASE_MANAGER: [
    "dashboard",
    "purchase:indent",
    "purchase:approval",
    "purchase:quotation",
    "purchase:vendor-selection",
    "purchase:po",
    "purchase:po-approval",
    "purchase:po-dispatch",
    "purchase:follow-up",
    "purchase:payment",
    "purchase:logistics",
    "purchase:receipt",
    "purchase:stock",
    "purchase:returns",
    "masters:*",
    "reports:*",
  ],
  PURCHASE_EXECUTIVE: [
    "dashboard",
    "purchase:indent",
    "purchase:quotation",
    "purchase:vendor-selection",
    "purchase:po",
    "purchase:po-dispatch",
    "purchase:follow-up",
    "masters:vendors",
    "masters:materials",
    "reports:po-status",
  ],
  ACCOUNTS: [
    "dashboard",
    "purchase:payment",
    "purchase:po",
    "masters:vendors",
    "masters:tax",
    "masters:payment-terms",
    "reports:payment",
    "reports:purchase-register",
  ],
  STORE_MANAGER: [
    "dashboard",
    "purchase:receipt",
    "purchase:stock",
    "purchase:returns",
    "masters:materials",
    "masters:warehouses",
    "reports:material-receipt",
  ],
  DEPARTMENT_HEAD: [
    "dashboard",
    "purchase:indent",
    "purchase:approval",
    "purchase:po-approval",
    "reports:pending-purchase",
  ],
};
