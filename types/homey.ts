export type ExpenseCategory = "materials" | "labor" | "permits" | "utilities" | "inspection" | "design";
export type BillUtilityType = "electricity" | "water" | "gas" | "internet" | "trash" | "insurance";
export type MaintenancePriority = "critical" | "recommended" | "seasonal";
export type MaintenanceStatus = "pending" | "overdue" | "completed";
export type ReminderChannel = "email" | "push" | "sms";
export type ApplianceStatus = "excellent" | "monitor" | "service-soon" | "replace";
export type VendorType = "plumbing" | "electrical" | "hvac" | "roofing" | "landscaping" | "general" | "appliance" | "cleaning";
export type PlanTier = "free" | "vault_plus";
export type VaultDocumentType = "receipt" | "warranty" | "photo" | "report" | "vehicle";
export type VehicleStatus = "excellent" | "monitor" | "service-soon" | "repair";

export type Project = {
  id: string;
  name: string;
  area: string;
  budget: number;
  spent: number;
  status: "planning" | "active" | "completed";
};

export type Expense = {
  id: string;
  date: string;
  vendor: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  projectId?: string;
  documentUrl?: string;
  taxDeductible: boolean;
};

export type MaintenanceTask = {
  id: string;
  title: string;
  area: string;
  notes?: string;
  cadence: string;
  dueDate: string;
  reminderDate?: string;
  reminderChannel?: ReminderChannel;
  assignedVendorId?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
};

export type Appliance = {
  id: string;
  name: string;
  brand: string;
  model: string;
  location: string;
  installDate: string;
  expectedLifespanYears: number;
  notes?: string;
  lastServiceDate?: string;
  nextServiceDate: string;
  warrantyExpires?: string;
  warrantyDocumentUrl?: string;
  status: ApplianceStatus;
  assignedVendorId?: string;
};

export type VaultDocument = {
  id: string;
  name: string;
  type: VaultDocumentType;
  url: string;
  linkedTo: string;
  uploadedAt: string;
};

export type Vehicle = {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin?: string;
  lastServiceDate?: string;
  nextServiceDate: string;
  notes?: string;
  status: VehicleStatus;
};

export type Vendor = {
  id: string;
  name: string;
  company: string;
  type: VendorType;
  phone: string;
  email: string;
  address: string;
  rating: number;
  preferred: boolean;
  notes: string;
};
