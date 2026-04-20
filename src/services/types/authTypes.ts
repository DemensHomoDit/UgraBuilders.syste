export type UserRole = string;

export interface ProjectStats {
  total?: number;
  completed?: number;
  inProgress?: number;
  planned?: number;
  totalArea: number;
  completedArea: number;
  materialsUsed: number;
  workHours: number;
  startDate: string;
  estimatedEndDate: string;
  actualEndDate?: string;
}

export interface ContactPerson {
  id: string;
  fullName: string;
  avatar?: string;
  role: string;
  phone?: string;
  email?: string;
}

export interface ProjectContacts {
  manager?: ContactPerson;
  technicalSupport?: ContactPerson;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  clientStage?: string;
  folders?: {
    photos: string[];
    documents: string[];
    contracts: string[];
  };
  projectStats?: ProjectStats;
  projectContacts?: ProjectContacts;
}

export interface FileData {
  id: string;
  name: string;
  type: string;
  data: string; // base64 encoded
  date: string;
  userId: string;
  folderType: "photos" | "documents" | "contracts";
  uploadedBy?: { id: string; username: string; role: UserRole };
}
