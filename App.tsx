
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import ResultView from './components/ResultView';
import AdminDashboard from './components/AdminDashboard';
import { SearchParams, StudentResult, ViewMode, SiteConfig } from './types';
import { supabase } from './lib/supabase';

const DEFAULT_CONFIG: SiteConfig = {
  header_top: "SỞ GIÁO DỤC VÀ ĐÀO TẠO THÀNH PHỐ",
  header_sub: "TRƯỜNG TRUNG HỌC PHỔ THÔNG CHUYÊN",
  main_title: "KỲ THI CHỌN HỌC SINH GIỎI THÀNH PHỐ",
  footer_copyright: "Bản quyền thuộc về Trường THPT Chuyên – Phòng GD&ĐT Thành phố",
  footer_address: "Địa chỉ: Số 01 Đại lộ Giáo dục, Quận Trung tâm, TP. Hà Nội",
  footer_support: "Hỗ trợ kỹ thuật: (024) 123 4567 - Email: congthongtin@school.edu.vn"
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('search');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<boolean>(false);

  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setIsLoggedIn(true);
    });

    const startSession = async () => {
      try {
        setInitializing(true);
        setDbError(false);
        
        // MẶC ĐỊNH XÓA TOÀN BỘ DANH DÁCH HỌC SINH CŨ KHI KHỞI ĐỘNG
        // Để đảm bảo danh sách rỗng ban đầu.
        const { error: deleteError } = await supabase
          .from('students')
          .delete()
          .neq('id', '0'); // Xóa tất cả các bản ghi có id khác '0' (tất cả)
        
        if (deleteError) {
          console.warn("Lỗi khi xóa dữ liệu cũ:", deleteError.message);
          // Nếu bảng chưa tồn tại, có thể bỏ qua lỗi này
          if (!deleteError.message.includes('not found')) {
            // throw deleteError; 
          }
        }

        // Đặt danh sách local về rỗng
        setStudents([]);

        // Fetch Config
        const { data: configData, error: configError } = await supabase
          .from('site_config')
          .select('*')
          .single();
        
        if (!configError && configData) {
          const { id, created_at, ...cleanConfig } = configData;
          setSiteConfig(cleanConfig as SiteConfig);
        } else if (configError && (configError.code === 'PGRST116' || configError.message.includes('not found'))) {
          // Seed default config
          await supabase.from('site_config').insert([{ ...DEFAULT_CONFIG, id: 1 }]);
        }

      } catch (err: any) {
        console.error('Database Error:', err.message);
        if (err.message.includes('students') || err.message.includes('cache')) {
            setDbError(true);
        }
      } finally {
        setInitializing(false);
      }
    };

    startSession();

    // Đã xóa phần subscription realtime để tránh vòng lặp xóa dữ liệu và giữ trạng thái rỗng ban đầu sạch sẽ.
    
    return () => { 
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: searchError } = await supabase
        .from('students')
        .select('*')
        .ilike('full_name', params.full_name.trim())
        .eq('sbd', params.sbd.toUpperCase().trim())
        .eq('cccd', params.cccd.trim())
        .maybeSingle();

      if (searchError) throw searchError;

      if (data) {
        setResult(data);
      } else {
        setError('Không tìm thấy kết quả phù hợp. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      setError('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (updated: StudentResult) => {
    try {
      const { error } = await supabase.from('students').update(updated).eq('id', updated.id);
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách học sinh? Hành động này không thể hoàn tác!')) {
      return;
    }
    try {
      // Supabase yêu cầu điều kiện where khi delete. Dùng id khác 0 để xóa tất cả.
      const { error } = await supabase.from('students').delete().neq('id', '0');
      if (error) throw error;
      setStudents([]);
      alert('Đã xóa toàn bộ dữ liệu học sinh thành công.');
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleAddStudent = async (newStudent: Omit<StudentResult, 'id'>) => {
    try {
      const { data, error } = await supabase.from('students').insert([newStudent]).select().single();
      if (error) throw error;
      if (data) setStudents(prev => [data, ...prev]);
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleBulkAdd = async (newStudents: Omit<StudentResult, 'id'>[]) => {
    try {
      const { data, error } = await supabase.from('students').insert(newStudents).select();
      if (error) throw error;
      if (data) {
        setStudents(prev => [...data, ...prev]);
        alert(`THÀNH CÔNG: Đã nhập liệu ${data.length} thí sinh vào hệ thống!`);
      }
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const saveConfigToStorage = async (newConfig: SiteConfig) => {
    try {
      const { error } = await supabase.from('site_config').upsert([{ ...newConfig, id: 1 }]);
      if (error) throw error;
      setSiteConfig(newConfig);
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Fallback login for development
    if (email === 'admin@school.edu.vn' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      alert('Đăng nhập thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  if (initializing) return <div className="min-h-screen flex items-center justify-center">Đang làm mới dữ liệu hệ thống...</div>;

  if (dbError) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">LỖI CẤU TRÚC DỮ LIỆU</h2>
        <p className="text-gray-600 mb-6">Bạn cần cập nhật lại bảng trong Supabase theo cấu trúc snake_case mới để sửa lỗi 'Could not find column'.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Thử lại</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header config={siteConfig} />
      <div className="bg-white border-b border-gray-100 py-2 sticky top-0 z-40 px-4 flex justify-end space-x-4 items-center">
        <button onClick={() => setView('search')} className={`text-xs font-bold uppercase ${view === 'search' ? 'text-blue-600' : 'text-gray-400'}`}>Tra cứu</button>
        <button 
          onClick={() => setView('admin')} 
          className={`p-1.5 rounded-full transition-all ${view === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-gray-500'}`}
          title="Khu vực quản trị"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>
      <main className="flex-grow py-10 px-4">
        {view === 'search' ? (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-blue-900 text-center uppercase mb-10">{siteConfig.main_title}</h2>
            {error && <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
            <SearchForm onSearch={handleSearch} loading={loading} />
            {result && <ResultView result={result} onClose={() => setResult(null)} />}
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase">Đăng nhập Quản trị</h3>
                  <p className="text-sm text-gray-500 mt-2">Vui lòng đăng nhập để truy cập hệ thống</p>
                </div>
                
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">Email quản trị</label>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" 
                      placeholder="admin@school.edu.vn" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">Mật khẩu</label>
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors uppercase text-sm"
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                students={students} 
                siteConfig={siteConfig}
                onUpdate={handleUpdateStudent} 
                onDelete={handleDeleteStudent}
                onDeleteAll={handleDeleteAll}
                onAdd={handleAddStudent}
                onBulkAdd={handleBulkAdd}
                onConfigUpdate={saveConfigToStorage}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>
      <Footer config={siteConfig} />
    </div>
  );
};

export default App;
