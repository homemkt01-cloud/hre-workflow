import React from 'react';
import { Listing, ListingStatus, UserRole } from '../types';
import { STATUS_COLORS } from '../constants';
import { ExternalLink, Camera, CheckCircle, XCircle, FileImage, Eye, Edit3, UploadCloud } from 'lucide-react';

interface CardProps {
  listing: Listing;
  role: UserRole;
  onStatusChange: (id: string, newStatus: ListingStatus) => void;
}

export const Card: React.FC<CardProps> = ({ listing, role, onStatusChange }) => {
  const isPhotographer = role === UserRole.PHOTOGRAPHER;
  const isAdmin = role === UserRole.ADMIN;

  // Render actions based on Role and current Status
  const renderActions = () => {
    if (isPhotographer) {
      if (listing.status === ListingStatus.NEW) {
        return (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onStatusChange(listing.id, ListingStatus.TO_EDIT)}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-brandYellow hover:bg-brandYellowHover text-midnight py-1.5 px-2 rounded font-semibold transition-colors"
            >
              <Edit3 size={14} />
              ต้องแต่ง
            </button>
            <button
              onClick={() => onStatusChange(listing.id, ListingStatus.NO_EDIT)}
              className="flex-1 flex items-center justify-center gap-1 text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 py-1.5 px-2 rounded font-medium transition-colors"
            >
              <CheckCircle size={14} />
              ไม่ต้องแต่ง
            </button>
             <button
              onClick={() => onStatusChange(listing.id, ListingStatus.REJECTED)}
              className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
              title="Reject"
            >
              <XCircle size={16} />
            </button>
          </div>
        );
      }
      if (listing.status === ListingStatus.TO_EDIT) {
        return (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
             <button
              onClick={() => onStatusChange(listing.id, ListingStatus.FINISHED)}
              className="w-full flex items-center justify-center gap-1 text-xs bg-midnight text-white hover:bg-gray-800 py-2 px-2 rounded font-medium transition-colors"
            >
              <UploadCloud size={14} />
              แต่งเสร็จ/อัปโหลดแล้ว
            </button>
          </div>
        );
      }
    }
    
    // Admin just views, or maybe moves back if there is an issue (simplified for now)
    if (isAdmin && (listing.status === ListingStatus.FINISHED || listing.status === ListingStatus.NO_EDIT)) {
         return (
             <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} /> Ready for Website
                </span>
             </div>
         )
    }

    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-3 transition-all hover:shadow-md ${STATUS_COLORS[listing.status]} relative group`}>
      
      {/* Header Info */}
      <div className="flex justify-between items-start mb-2">
        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">
          {listing.code}
        </span>
        <span className="text-[10px] text-gray-400">
          {listing.updatedAt.toLocaleDateString('th-TH')}
        </span>
      </div>

      {/* Main Content */}
      <h3 className="text-sm font-bold text-midnight mb-1 line-clamp-1" title={listing.name}>
        {listing.name}
      </h3>
      <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-brandYellow"></span>
        {listing.team}
      </div>

      {/* Image Preview & Drive Link */}
      <div className="relative mb-3 rounded-md overflow-hidden bg-gray-50 border border-gray-100 h-32 group-hover:border-brandYellow/50 transition-colors">
        <img 
            src={listing.imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" 
        />
        <a 
            href={listing.driveLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-midnight text-xs px-2 py-1 rounded shadow-sm flex items-center gap-1 font-medium backdrop-blur-sm"
        >
            <ExternalLink size={12} />
            Drive
        </a>
      </div>

      {/* Role-based Actions */}
      {renderActions()}

      {/* Status Badge (if not obvious by column) - Optional, mainly for specific lists */}
      {listing.status === ListingStatus.REJECTED && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 border-2 border-red-500 text-red-500 text-lg font-bold px-2 py-1 rounded opacity-30 select-none pointer-events-none">
              REJECTED
          </div>
      )}
    </div>
  );
};