
import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { StudentResult, SiteConfig } from '../types';
import EditModal from './EditModal';
import ConfigModal from './ConfigModal';

interface AdminDashboardProps {
  students: StudentResult[];
  siteConfig: SiteConfig;
  onUpdate: (updated: StudentResult) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (newStudent: Omit<StudentResult, 'id'>) => void;
  onBulkAdd: (newStudents: Omit<StudentResult, 'id'>[]) => void;
  onConfigUpdate: (newConfig: SiteConfig) => void;
  onLogout: () => void;
}

const ITEMS_PER_PAGE = 20;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, siteConfig, onUpdate, onDelete, onDeleteAll, onAdd, onBulkAdd, onConfigUpdate, onLogout }) => {
  const [editingStudent, setEditingStudent] = useState<StudentResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination Logic
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const begin = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = begin + ITEMS_PER_PAGE;
    return students.slice(begin, end);
  }, [students, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDownloadTemplate = () => {
    const headers = ['Họ và tên', 'Số báo danh', 'CCCD', 'Trường', 'Môn thi', 'Điểm', 'Xếp giải'];
    const sampleData = [
      ['NGUYỄN VĂN A', 'HSG001', '001203004567', 'THPT Chuyên', 'Toán học', 18.5, 'Giải Nhất'],
      ['TRẦN THỊ B', 'HSG002', '001203004568', 'THPT A', 'Vật lý', 15.0, 'Giải Ba']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

    const wscols = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Lieu");
    XLSX.writeFile(wb, "Mau_Nhap_Diem_HSG.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const newStudents = jsonData.slice(1).map(row => ({
          full_name: String(row[0] || '').trim().toUpperCase(),
          sbd: String(row[1] || '').trim().toUpperCase(),
          cccd: String(row[2] || '').replace(/\D/g, ''),
          school: String(row[3] || '').trim(),
          subject: String(row[4] || '').trim(),
          score: parseFloat(row[5]) || 0,
          award: String(row[6] || 'Không đạt').trim()
        })).filter(s => s.full_name && s.sbd);
        
        if (newStudents.length === 0) {
          alert("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
          return;
        }

        onBulkAdd(newStudents);
        setCurrentPage(1); // Reset to page 1 after import
      } catch (error) {
        alert("Lỗi khi đọc file Excel.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div><h3 className="text-xl font-black text-blue-900">QUẢN TRỊ DỮ LIỆU ({students.length})</h3></div>
        <div className="flex flex-wrap gap-2 justify-center">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx" onChange={handleFileUpload} />
          
          <button onClick={handleDownloadTemplate} className="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg font-bold text-xs uppercase flex items-center space-x-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Tải file mẫu</span>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-bold text-xs uppercase flex items-center space-x-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>Nhập Excel</span>
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>

          <button onClick={onDeleteAll} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase transition-colors flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span>XÓA TẤT CẢ</span>
          </button>

          <button onClick={() => setIsConfiguring(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase transition-colors">Cấu hình</button>
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase transition-colors">Thêm mới</button>
          <button onClick={onLogout} className="px-4 py-2 border hover:bg-gray-50 rounded-lg font-bold text-xs uppercase transition-colors">Thoát</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-100">
              <tr className="text-[11px] font-black uppercase text-gray-600">
                <th className="p-3 border-b border-r border-gray-200 w-24">SBD</th>
                <th className="p-3 border-b border-r border-gray-200">Họ và tên</th>
                <th className="p-3 border-b border-r border-gray-200 w-32">CCCD</th>
                <th className="p-3 border-b border-r border-gray-200">Trường</th>
                <th className="p-3 border-b border-r border-gray-200 w-32">Môn thi</th>
                <th className="p-3 border-b border-r border-gray-200 w-20 text-center">Điểm</th>
                <th className="p-3 border-b border-r border-gray-200 w-28">Giải</th>
                <th className="p-3 border-b border-gray-200 w-24 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentData.length > 0 ? currentData.map((s, index) => (
                <tr key={s.id} className={`hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="p-3 border-b border-r border-gray-100 font-bold text-blue-600">{s.sbd}</td>
                  <td className="p-3 border-b border-r border-gray-100 font-bold uppercase">{s.full_name}</td>
                  <td className="p-3 border-b border-r border-gray-100">{s.cccd}</td>
                  <td className="p-3 border-b border-r border-gray-100">{s.school}</td>
                  <td className="p-3 border-b border-r border-gray-100">{s.subject}</td>
                  <td className="p-3 border-b border-r border-gray-100 text-center font-bold">{s.score}</td>
                  <td className="p-3 border-b border-r border-gray-100 font-bold text-red-600">{s.award}</td>
                  <td className="p-3 border-b text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => setEditingStudent(s)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Sửa">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => onDelete(s.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Xóa">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">Chưa có dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, students.length)}</span> trong tổng số <span className="font-bold">{students.length}</span> học sinh
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show current, first, last, and pages near current
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`min-w-[40px] px-3 py-2 text-sm font-bold border rounded-lg transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'hover:bg-white text-gray-600 bg-transparent'}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}

              <button 
                onClick={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {editingStudent && <EditModal student={editingStudent} onSave={u => { onUpdate(u); setEditingStudent(null); }} onClose={() => setEditingStudent(null)} />}
      {isAdding && (
        <EditModal 
          student={{ id: '', full_name: '', sbd: '', cccd: '', school: '', subject: '', score: 0, award: 'Không đạt' }} 
          onSave={n => { 
            const { id, ...rest } = n;
            onAdd(rest); 
            setIsAdding(false); 
          }} 
          onClose={() => setIsAdding(false)} 
        />
      )}
      {isConfiguring && <ConfigModal config={siteConfig} onSave={c => { onConfigUpdate(c); setIsConfiguring(false); }} onClose={() => setIsConfiguring(false)} />}
    </div>
  );
};

export default AdminDashboard;
