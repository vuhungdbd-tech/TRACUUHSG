
import React, { useState } from 'react';
import { SiteConfig } from '../types';

interface ConfigModalProps {
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ config, onSave, onClose }) => {
  const [formData, setFormData] = useState<SiteConfig>({ ...config });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-slate-800 p-4 text-white font-bold text-center uppercase">CẤU HÌNH HỆ THỐNG</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề cấp trên</label><input type="text" name="header_top" value={formData.header_top} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề đơn vị</label><input type="text" name="header_sub" value={formData.header_sub} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Tên kỳ thi</label><input type="text" name="main_title" value={formData.main_title} onChange={handleChange} className="w-full p-3 border rounded-xl font-bold text-blue-900" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Bản quyền</label><input type="text" name="footer_copyright" value={formData.footer_copyright} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ</label><input type="text" name="footer_address" value={formData.footer_address} onChange={handleChange} className="w-full p-3 border rounded-xl" /></div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold">Đóng</button>
            <button type="submit" className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;
