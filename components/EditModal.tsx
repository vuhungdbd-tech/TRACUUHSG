
import React, { useState } from 'react';
import { StudentResult } from '../types';

interface EditModalProps {
  student: StudentResult;
  onSave: (updated: StudentResult) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ student, onSave, onClose }) => {
  const [formData, setFormData] = useState<StudentResult>({ ...student });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;

    // Chuẩn hóa dữ liệu ngay khi nhập
    if (name === 'score') {
      finalValue = parseFloat(value) || 0;
    } else if (name === 'full_name' || name === 'sbd') {
      // Tự động viết hoa Tên và SBD để khớp với logic tìm kiếm
      finalValue = value.toUpperCase();
    } else if (name === 'cccd') {
      // Chỉ cho phép nhập số
      finalValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: finalValue 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-blue-600 p-4 text-white font-bold text-center">HỒ SƠ THÍ SINH</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ và tên</label>
            <input 
              type="text" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              placeholder="NGUYỄN VĂN A" 
              className="w-full p-3 border border-gray-300 rounded-xl uppercase font-bold focus:border-blue-500 outline-none" 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số báo danh</label>
              <input 
                type="text" 
                name="sbd" 
                value={formData.sbd} 
                onChange={handleChange} 
                placeholder="HSG001" 
                className="w-full p-3 border border-gray-300 rounded-xl uppercase font-bold focus:border-blue-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CCCD</label>
              <input 
                type="text" 
                name="cccd" 
                value={formData.cccd} 
                onChange={handleChange} 
                placeholder="001..." 
                maxLength={12}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-blue-500 outline-none" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trường</label>
            <input 
              type="text" 
              name="school" 
              value={formData.school} 
              onChange={handleChange} 
              placeholder="Tên trường..." 
              className="w-full p-3 border border-gray-300 rounded-xl focus:border-blue-500 outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Môn thi</label>
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              placeholder="Toán, Lý, Hóa..." 
              className="w-full p-3 border border-gray-300 rounded-xl focus:border-blue-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Điểm số</label>
              <input 
                type="number" 
                step="0.01" 
                name="score" 
                value={formData.score} 
                onChange={handleChange} 
                placeholder="0.00" 
                className="w-full p-3 border border-gray-300 rounded-xl font-bold focus:border-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Xếp giải</label>
              <select 
                name="award" 
                value={formData.award} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-300 rounded-xl font-bold focus:border-blue-500 outline-none"
              >
                <option value="Giải Nhất">Giải Nhất</option>
                <option value="Giải Nhì">Giải Nhì</option>
                <option value="Giải Ba">Giải Ba</option>
                <option value="Khuyến khích">Khuyến khích</option>
                <option value="Không đạt">Không đạt</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">Hủy</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Lưu dữ liệu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
