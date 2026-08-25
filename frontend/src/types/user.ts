export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";
export type SubscriptionPlan = "free" | "bronze" | "silver" | "gold";

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  about?: string;
  tags?: string[];
  role: UserRole;
  status: UserStatus;
  reputation: number;
  subscription: SubscriptionInfo;
  preferredLanguage: string;
  joinDate?: string;
  token?: string;
}
