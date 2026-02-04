import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Filter, List as ListIcon, RefreshCw, Loader2, WifiOff } from 'lucide-react';
import { Listing, ListingStatus, UserRole } from './types';
import { STATUS_LABELS } from './constants';
import { Logo } from './components/Logo';
import { Card } from './components/Card';
import { NewListingModal } from './components/NewListingModal';

// --- CONFIGURATION ---
// TODO: ทำตามขั้นตอนใน GOOGLE_SHEETS_SETUP.md แล้วนำ URL มาวางแทนที่ string ว่างด้านล่างนี้
// ตัวอย่าง: "https://script.google.com/macros/s/AKfycbx.../exec"
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqgZg7XSwKjCLXRCiai5xYPtsh9ciEcVqJl9VHYUJ5sawksBTl36eZZBl84-cpCkSa/exec"; 

const App: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.PHOTOGRAPHER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  // --- DATA MAPPING HELPER ---
  // แปลงข้อมูลดิบจาก Google Sheets (snake_case) ให้เป็น Type ของ React (camelCase)
  const mapSheetRowToListing = (row: any): Listing => {
    // กรณีข้อมูลใหม่ที่ยังไม่มี ID
    const safeDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    return {
      id: row.id ? String(row.id) : Math.random().toString(36),
      code: row.code || '',
      name: row.name || '',
      team: row.team || '',
      driveLink: row.drive_link || '',
      status: (row.status as ListingStatus) || ListingStatus.NEW,
      createdAt: safeDate(row.created_at), // ใน Sheet ไม่มี field นี้ก็ได้ แต่ใส่กันเหนียว
      updatedAt: safeDate(row.updated_at),
      imageUrl: row.image_url || `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    };
  };

  // --- API OPERATIONS ---
  const fetchListings = useCallback(async () => {
    if (!GOOGLE_SCRIPT_URL) {
       // ถ้ายังไม่ใส่ URL ให้ใช้ Mock data ไปก่อนเพื่อให้หน้าเว็บไม่พัง
       console.warn("GOOGLE_SCRIPT_URL is missing. Using local mode.");
       return; 
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedListings = data.map(mapSheetRowToListing);
        // เรียงลำดับตามวันที่อัปเดตล่าสุด
        mappedListings.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        setListings(mappedListings);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Actions
  const handleAddListing = async (data: Omit<Listing, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    // 1. Optimistic Update (อัปเดตหน้าจอทันทีเพื่อให้ผู้ใช้รู้สึกเร็ว)
    const tempId = Math.random().toString(36).substr(2, 9);
    const newListing: Listing = {
      ...data,
      id: tempId,
      status: ListingStatus.NEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    };
    setListings(prev => [newListing, ...prev]);

    // 2. Send to API
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // สำคัญ: Google Script มักต้องใช้ no-cors สำหรับ simple post
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            code: data.code,
            name: data.name,
            team: data.team,
            driveLink: data.driveLink,
            imageUrl: newListing.imageUrl
          })
        });
        // หมายเหตุ: เนื่องจาก no-cors เราจะไม่ได้รับ response กลับมาเช็ค แต่เราเชื่อว่ามันส่งไปแล้ว
        // ใน Production จริง อาจจะทำระบบ refresh background อีกที
        setTimeout(fetchListings, 2000); // Refresh data after delay to sync ID
      } catch (err) {
        console.error("Failed to sync create", err);
        alert("การเชื่อมต่อมีปัญหา ข้อมูลอาจยังไม่ถูกบันทึกลง Sheet");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: ListingStatus) => {
    // 1. Optimistic Update
    setListings(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus, updatedAt: new Date() } : item
    ));

    // 2. Send to API
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateStatus',
            id: id,
            newStatus: newStatus
          })
        });
      } catch (err) {
        console.error("Failed to sync update", err);
        // Revert status if needed (optional)
      }
    }
  };

  // Filter Logic
  const filteredListings = useMemo(() => {
    return listings.filter(l => 
      l.code.toLowerCase().includes(filterText.toLowerCase()) ||
      l.name.toLowerCase().includes(filterText.toLowerCase()) ||
      l.team.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [listings, filterText]);

  // Group by Status for Kanban
  const listingsByStatus = useMemo(() => {
    const grouped: Record<string, Listing[]> = {
      [ListingStatus.NEW]: [],
      [ListingStatus.TO_EDIT]: [],
      [ListingStatus.FINISHED]: [],
      [ListingStatus.NO_EDIT]: [],
      [ListingStatus.REJECTED]: []
    };
    
    filteredListings.forEach(l => {
        if (grouped[l.status]) grouped[l.status].push(l);
    });
    return grouped;
  }, [filteredListings]);

  const columns = [
    { id: ListingStatus.NEW, title: STATUS_LABELS[ListingStatus.NEW], color: 'bg-blue-50 border-blue-200' },
    { id: ListingStatus.TO_EDIT, title: STATUS_LABELS[ListingStatus.TO_EDIT], color: 'bg-yellow-50 border-brandYellow' },
    { id: ListingStatus.FINISHED, title: STATUS_LABELS[ListingStatus.FINISHED], color: 'bg-green-50 border-green-200' },
    { id: ListingStatus.NO_EDIT, title: STATUS_LABELS[ListingStatus.NO_EDIT], color: 'bg-teal-50 border-teal-200' },
    { id: ListingStatus.REJECTED, title: STATUS_LABELS[ListingStatus.REJECTED], color: 'bg-red-50 border-red-200' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
      {/* Header */}
      <header className="bg-midnight shadow-lg sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
             {/* Role Switcher */}
             <div className="hidden md:flex items-center gap-2 mr-4 bg-white/10 px-3 py-1 rounded-full">
                <span className="text-white/60 text-xs uppercase tracking-wider">View as:</span>
                <select 
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                    className="bg-transparent text-brandYellow text-sm font-bold focus:outline-none cursor-pointer"
                >
                    <option value={UserRole.SALES}>Sales Team</option>
                    <option value={UserRole.PHOTOGRAPHER}>Photographer</option>
                    <option value={UserRole.ADMIN}>Admin / Web</option>
                </select>
             </div>

            {currentRole === UserRole.SALES && (
                <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-brandYellow text-midnight px-4 py-2 rounded-md font-bold text-sm hover:bg-brandYellowHover transition-transform active:scale-95 shadow-lg shadow-brandYellow/20"
                >
                <Plus size={18} strokeWidth={3} />
                เพิ่มรายการ
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Controls */}
      <div className="max-w-[1600px] mx-auto px-4 py-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-midnight mb-1">A-List Workflow Board</h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-sm">
                    จัดการสถานะรูปภาพและการส่งมอบงาน
                  </p>
                  {/* Status Indicator */}
                  {!GOOGLE_SCRIPT_URL ? (
                    <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded flex items-center gap-1">
                      <WifiOff size={10} /> Local Mode (No URL)
                    </span>
                  ) : isLoading ? (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Syncing...
                    </span>
                  ) : error ? (
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded cursor-pointer" onClick={fetchListings}>
                       Error (Retry)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-600 rounded flex items-center gap-1">
                       Online
                    </span>
                  )}
                </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="ค้นหา Code, Project, Team..."
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brandYellow w-full shadow-sm"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                <button 
                  onClick={fetchListings}
                  className="bg-white p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-midnight hover:border-midnight transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>
        </div>

        {/* Kanban Board */}
        <div className="flex overflow-x-auto pb-6 gap-4 items-start h-[calc(100vh-220px)] snap-x">
            {columns.map(col => {
                const count = listingsByStatus[col.id].length;
                
                return (
                    <div key={col.id} className="min-w-[280px] w-[320px] flex-shrink-0 flex flex-col h-full snap-start">
                        {/* Column Header */}
                        <div className={`flex items-center justify-between p-3 rounded-t-lg border-b-4 bg-white shadow-sm mb-3 ${col.color.split(' ')[1]}`}>
                            <span className="font-bold text-gray-700 text-sm uppercase">{col.title}</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex-1 overflow-y-auto pr-1 pb-10">
                            {isLoading && listings.length === 0 ? (
                                <div className="flex justify-center py-10">
                                   <Loader2 className="animate-spin text-gray-400" />
                                </div>
                            ) : count === 0 ? (
                                <div className="text-center py-10 opacity-40">
                                    <div className="bg-gray-200 w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center">
                                        <ListIcon className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">ไม่มีรายการ</p>
                                </div>
                            ) : (
                                listingsByStatus[col.id].map(listing => (
                                    <Card 
                                        key={listing.id} 
                                        listing={listing} 
                                        role={currentRole}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      <NewListingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddListing}
      />
    </div>
  );
};

export default App;