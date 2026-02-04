export enum ListingStatus {
  NEW = 'NEW',             // รายการใหม่ (Sales sent, Photographer hasn't seen)
  TO_EDIT = 'TO_EDIT',     // เตรียมแต่ง (Needs editing)
  NO_EDIT = 'NO_EDIT',     // ไม่ต้องแต่ง (Good as is)
  FINISHED = 'FINISHED',   // แต่งเสร็จ (Edited and uploaded)
  REJECTED = 'REJECTED'    // Reject (Bad data/photos)
}

export interface Listing {
  id: string;
  code: string;       // Property Code
  name: string;       // Property Name/Project
  team: string;       // Sales Team Name
  driveLink: string;  // Google Drive Link
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string; // Simulated preview
}

export enum UserRole {
  SALES = 'Sales',
  PHOTOGRAPHER = 'Photographer',
  ADMIN = 'Admin/BackOffice'
}