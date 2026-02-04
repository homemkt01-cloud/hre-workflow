import React, { useState } from 'react';
import { Listing } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Listing, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
}

export const NewListingModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    team: '',
    driveLink: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ code: '', name: '', team: '', driveLink: '' }); // Reset
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-midnight px-6 py-4 flex justify-between items-center">
          <h2 className="text-brandYellow font-bold text-lg">เพิ่มรายการ A-List ใหม่</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสทรัพย์ (Code)</label>
            <input
              required
              type="text"
              placeholder="Ex. HRE-123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandYellow focus:border-transparent transition-all"
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโครงการ / ทรัพย์ (Name)</label>
            <input
              required
              type="text"
              placeholder="Ex. Condo The Room"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandYellow focus:border-transparent transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ทีม (Sales Team)</label>
            <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandYellow focus:border-transparent bg-white"
                value={formData.team}
                onChange={e => setFormData({...formData, team: e.target.value})}
                required
            >
                <option value="">เลือกทีม...</option>
                <option value="Team Alpha">Team Alpha</option>
                <option value="Team Beta">Team Beta</option>
                <option value="Team Gamma">Team Gamma</option>
                <option value="Team Delta">Team Delta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drive Link (รูปภาพต้นฉบับ)</label>
            <input
              required
              type="url"
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandYellow focus:border-transparent transition-all"
              value={formData.driveLink}
              onChange={e => setFormData({...formData, driveLink: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-1">*ตากล้องจะอัปโหลดรูปที่แต่งแล้วกลับไปที่ลิงก์นี้</p>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brandYellow hover:bg-brandYellowHover text-midnight rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
            >
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};