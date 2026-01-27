
import React, { useState, useEffect } from 'react';
import { SearchParams } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState<SearchParams>({
    full_name: '',
    sbd: '',
    cccd: ''
  });

  const [captchaCode, setCaptchaCode] = useState('');
  const [userInputCaptcha, setUserInputCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(result);
    setUserInputCaptcha('');
    setCaptchaError(false);
  };

  useEffect(() => { generateCaptcha(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputCaptcha.toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      return;
    }
    if (formData.cccd.length !== 12) {
      alert('Số CCCD phải gồm 12 chữ số.');
      return;
    }
    onSearch(formData);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-[#1e88e5] px-6 py-5">
        <h3 className="text-lg font-black text-white text-center uppercase">TRA CỨU KẾT QUẢ THI</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
          <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="Ví dụ: NGUYỄN VĂN AN" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none uppercase" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Số báo danh <span className="text-red-500">*</span></label>
            <input type="text" name="sbd" required value={formData.sbd} onChange={handleChange} placeholder="HSG001" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none uppercase font-bold" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">CCCD (12 số) <span className="text-red-500">*</span></label>
            <input type="text" name="cccd" required maxLength={12} value={formData.cccd} onChange={e => handleChange({...e, target: {...e.target, value: e.target.value.replace(/\D/g, ''), name: 'cccd'}} as any)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase mb-1.5">Mã bảo mật <span className="text-red-500">*</span></label>
          <div className="flex space-x-3">
            <input type="text" required value={userInputCaptcha} onChange={e => setUserInputCaptcha(e.target.value)} className={`flex-1 px-4 py-3 bg-gray-50 border rounded-xl outline-none uppercase tracking-widest ${captchaError ? 'border-red-500' : 'border-gray-200'}`} />
            <div onClick={generateCaptcha} className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer font-black text-blue-900 tracking-widest line-through italic">{captchaCode}</div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest">
          {loading ? 'Đang kiểm tra...' : 'BẮT ĐẦU TRA CỨU'}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;
