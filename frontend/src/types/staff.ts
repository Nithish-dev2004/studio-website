// Staff and user management TypeScript definitions.

export type StaffRole = "admin" | "manager" | "photographer" | "editor" | "staff";
export type StaffStatus = "active" | "inactive";

export interface StaffUser {
  id: string;
  auth_user_id: string;
  employee_id: string;
  name: string;
  email: string;
  mobile: string;
  role: StaffRole;
  salary: number;
  status: StaffStatus;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export type StaffUserSafe = Omit<StaffUser, "salary"> & {
  salary?: number | null;
};

export interface StaffAuditLog {
  id: string;
  performed_by_email: string;
  target_user_id: string | null;
  action: "create" | "edit" | "activate" | "deactivate" | "reset_password";
  details: Record<string, unknown>;
  created_at: string;
}

export interface AdminProfile {
  user: {
    id: string;
    email?: string | null;
  };
  role: StaffRole;
  isSuperAdmin: boolean;
  staffUser: StaffUser | null;
}
