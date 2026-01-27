
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
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'score' ? parseFloat(value) || 0 : value 
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
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Họ tên" className="w-full p-3 border rounded-xl uppercase font-bold" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="sbd" value={formData.sbd} onChange={handleChange} placeholder="SBD" className="p-3 border rounded-xl uppercase" required />
            <input type="text" name="cccd" value={formData.cccd} onChange={handleChange} placeholder="CCCD" className="p-3 border rounded-xl" required />
          </div>
          <input type="text" name="school" value={formData.school} onChange={handleChange} placeholder="Trường" className="w-full p-3 border rounded-xl" />
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Môn thi" className="w-full p-3 border rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.25" name="score" value={formData.score} onChange={handleChange} placeholder="Điểm" className="p-3 border rounded-xl font-bold" />
            <select name="award" value={formData.award} onChange={handleChange} className="p-3 border rounded-xl font-bold">
              <option value="Giải Nhất">Giải Nhất</option><option value="Giải Nhì">Giải Nhì</option><option value="Giải Ba">Giải Ba</option><option value="Khuyến khích">Khuyến khích</option><option value="Không đạt">Không đạt</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl">Hủy</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
