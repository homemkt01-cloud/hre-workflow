import { Listing, ListingStatus } from './types';

export const STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.NEW]: 'รายการใหม่ (New)',
  [ListingStatus.TO_EDIT]: 'ต้องแต่งรูป (To Edit)',
  [ListingStatus.NO_EDIT]: 'รูปสวยแล้ว (No Edit)',
  [ListingStatus.FINISHED]: 'แต่งเสร็จแล้ว (Finished)',
  [ListingStatus.REJECTED]: 'Reject (แก้ไข)',
};

export const STATUS_COLORS: Record<ListingStatus, string> = {
  [ListingStatus.NEW]: 'border-l-4 border-blue-500',
  [ListingStatus.TO_EDIT]: 'border-l-4 border-brandYellow',
  [ListingStatus.NO_EDIT]: 'border-l-4 border-teal-500',
  [ListingStatus.FINISHED]: 'border-l-4 border-green-600',
  [ListingStatus.REJECTED]: 'border-l-4 border-red-500',
};

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: '1',
    code: 'HRE-001',
    name: 'The Bangkok Thonglor',
    team: 'Team Alpha',
    driveLink: 'https://drive.google.com/drive/folders/xyz',
    status: ListingStatus.NEW,
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '2',
    code: 'HRE-089',
    name: 'Noble Ploenchit',
    team: 'Team Beta',
    driveLink: 'https://drive.google.com/drive/folders/abc',
    status: ListingStatus.TO_EDIT,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '3',
    code: 'HRE-112',
    name: 'Ashton Asoke',
    team: 'Team Alpha',
    driveLink: 'https://drive.google.com/drive/folders/def',
    status: ListingStatus.FINISHED,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(),
    imageUrl: 'https://picsum.photos/400/300?random=3'
  },
   {
    id: '4',
    code: 'HRE-205',
    name: 'Park Origin',
    team: 'Team Delta',
    driveLink: 'https://drive.google.com/drive/folders/ghj',
    status: ListingStatus.NO_EDIT,
    createdAt: new Date(Date.now() - 200000),
    updatedAt: new Date(),
    imageUrl: 'https://picsum.photos/400/300?random=4'
  }
];