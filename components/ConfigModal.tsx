
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
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề cấp trên</label>
            <input type="text" name="header_top" value={formData.header_top} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề đơn vị</label>
            <input type="text" name="header_sub" value={formData.header_sub} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Tên kỳ thi</label>
            <input type="text" name="main_title" value={formData.main_title} onChange={handleChange} className="w-full p-3 border rounded-xl font-bold text-blue-900 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Đường dẫn Favicon (Icon trình duyệt)</label>
            <div className="flex space-x-3 items-center">
              <input 
                type="text" 
                name="favicon_url" 
                value={formData.favicon_url} 
                onChange={handleChange} 
                placeholder="https://example.com/favicon.png" 
                className="flex-1 p-3 border rounded-xl outline-none focus:border-blue-500" 
              />
              {formData.favicon_url && (
                <div className="w-10 h-10 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                   <img src={formData.favicon_url} alt="Favicon Preview" className="max-w-full max-h-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 italic">* Nhập link URL hình ảnh icon (định dạng .png, .ico, .jpg)</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Bản quyền</label>
            <input type="text" name="footer_copyright" value={formData.footer_copyright} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Địa chỉ</label>
            <input type="text" name="footer_address" value={formData.footer_address} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Thông tin hỗ trợ</label>
            <input type="text" name="footer_support" value={formData.footer_support} onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50 transition-colors">Đóng</button>
            <button type="submit" className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg">Lưu cấu hình</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;
