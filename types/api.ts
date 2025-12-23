// ZKBio API Response Types
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// Access Level Types
export interface AccessLevel {
  id?: string;
  LevelID?: number;
  Name?: string;
  name?: string;
  Description?: string;
  DoorIds?: number[];
  areaName?: string;
  timeSegName?: string;
}

export interface AccessLevelCreateRequest {
  name: string;
  description?: string;
  areaName?: string;
  timeSegName?: string;
}

// Person Types
export interface Person {
  PersonID?: number;
  pin: string;
  name: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  mobilePhone?: string;
  gender?: string;
  deptCode?: string;
  cardNo?: string;
  accLevelIds?: string;
  accStartTime?: string;
  accEndTime?: string;
  birthday?: string;
  certNumber?: string;
  certType?: string;
  hireDate?: string;
  isSendMail?: boolean;
  personPwd?: string;
  ssn?: string;
  supplyCards?: string;
}

export interface PersonCreateRequest {
  pin: string;
  name: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  mobilePhone?: string;
  gender?: string;
  deptCode?: string;
  cardNo?: string;
  personPwd?: string;
}

export interface PersonFilters {
  deptCodes?: string;
  pins?: string;
}

// Reader Types
export interface Reader {
  ReaderID?: number;
  name: string;
  deviceSn?: string;
  // Add other fields as needed from API documentation
}

// Account Types
export interface Account {
  accountId: number;
  principalPersonId: number;
  spousePersonId?: number;
  accountNumber: string;
  status: 'active' | 'inactive' | 'suspended';
  clientName: string;
  accessLevelId: number;
  createdAt: string;
  updatedAt: string;
}

// Access Log Types
export interface AccessLog {
  id?: string;
  personPin?: string;
  personName?: string;
  deviceSn?: string;
  doorName?: string;
  eventTime?: string;
  verifyModeName?: string;
  eventName?: string;
}

// Area Types
export interface Area {
  AreaID: number;
  Name: string;
  Description?: string;
}

// Door Types
export interface Door {
  doorId?: string;
  doorName?: string;
  deviceSn?: string;
  // Add other fields as needed from API documentation
}

// Transaction Types
export interface Transaction {
  id?: string;
  personPin?: string;
  personName?: string;
  deviceSn?: string;
  doorName?: string;
  eventTime?: string;
  verifyModeName?: string;
  eventName?: string;
}

export interface TransactionFilters {
  personPin?: string;
  startDate?: string;
  endDate?: string;
}

// Branch (Department) Types
export interface Branch {
  code: string;
  name: string;
  description?: string;
  parentCode?: string;
  level: number;
  isActive: boolean;
  createdAt?: string;
}

export interface BranchHierarchy extends Branch {
  children?: BranchHierarchy[];
  fullPath: string;
}

export interface BranchFilters {
  codes?: string;
  parentCode?: string;
}

// Notification Types
export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
}

// Registration Form Data
export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  spouseFirstName: string;
  spouseLastName: string;
  spouseDateOfBirth: string;
  spouseGender: string;
  spouseFingerIndex: string;
  fingerIndex: string;
  selectedAccessLevel: string;
  fingerprintData?: {
    template: string;
    quality: number;
    capturedAt: string;
    bioType: number;
    version: string;
    templateNo: string;
  } | null;
  spouseFingerprintData?: {
    template: string;
    quality: number;
    capturedAt: string;
    bioType: number;
    version: string;
    templateNo: string;
  } | null;
  registrationType: 'single' | 'couple';
}

// Legacy interfaces for backward compatibility
export interface User {
  id: number;
  accountNumber: string;
  firstName: string;
  lastName: string;
  userType: 'principal' | 'spouse';
  email?: string;
  phone?: string;
  cardNo?: string;
  gender: 'M' | 'F';
  fingerprintData?: {
    template: string;
    quality: number;
    capturedAt: string;
    bioType: number;
    version: string;
    templateNo: string;
  };
  selectedAccessLevel: string;
  selectedDoors: number[];
  fingerIndex: string;
  customFields: {
    occupation: string;
    nationality: string;
    idNumber: string;
    idType: string;
    idExpiry: string;
  };
  registeredAt: string;
  status: string;
  syncStatus: string;
}

export interface Card {
  CardID: number;
  CardNo: string;
  PersonID?: number;
  Status?: number;
}

export interface Department {
  DepartmentID: number;
  Name: string;
  ParentID?: number;
}

export interface BiometricTemplate {
  TemplateID: number;
  PersonID: number;
  Template: string; // Base64 encoded template data
  Type: number; // Biometric type (e.g., 1 for fingerprint)
}