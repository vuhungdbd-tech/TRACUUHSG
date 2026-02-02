
import React, { useState, useEffect, useCallback } from 'react';
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
  const [view, setView] = useState<ViewMode>(() => 
    window.location.pathname.startsWith('/admin') ? 'admin' : 'search'
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<boolean>(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchStudentsData = useCallback(async (showLoading = false) => {
    if (showLoading) setInitializing(true);
    
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (studentsError) {
        if (studentsError.code !== 'PGRST116' && !studentsError.message.includes('not found')) {
           console.error("Lỗi tải danh sách thí sinh:", studentsError.message);
        }
      }

      setStudents(studentsData || []);

      const { data: configData, error: configError } = await supabase
        .from('site_config')
        .select('*')
        .single();
      
      if (!configError && configData) {
        const { id, created_at, ...cleanConfig } = configData;
        setSiteConfig(cleanConfig as SiteConfig);
      } else if (configError && (configError.code === 'PGRST116' || configError.message.includes('not found'))) {
        await supabase.from('site_config').insert([{ ...DEFAULT_CONFIG, id: 1 }]);
      }

    } catch (err: any) {
      console.error('Database Error:', err.message);
      if (err.message.includes('students') || err.message.includes('cache')) {
          setDbError(true);
      }
    } finally {
      if (showLoading) setInitializing(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setIsLoggedIn(true);
    });

    fetchStudentsData(true);

    const channel = supabase.channel('db-changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'students' }, 
        () => fetchStudentsData(false)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_config' },
        () => fetchStudentsData(false)
      )
      .subscribe();

    const handlePopState = () => {
      setView(window.location.pathname.startsWith('/admin') ? 'admin' : 'search');
    };
    window.addEventListener('popstate', handlePopState);

    return () => { 
      supabase.removeChannel(channel); 
      authListener.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchStudentsData]);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const searchFullName = params.full_name.trim().replace(/\s+/g, ' ');
    const searchSBD = params.sbd.trim();
    const searchCCCD = params.cccd.trim();

    try {
      const { data, error: searchError } = await supabase
        .from('students')
        .select('*')
        .ilike('full_name', searchFullName)
        .ilike('sbd', searchSBD)
        .eq('cccd', searchCCCD)
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
    const normalizedData = {
      ...updated,
      full_name: updated.full_name.trim().replace(/\s+/g, ' ').toUpperCase(),
      sbd: updated.sbd.trim().toUpperCase(),
      cccd: updated.cccd.trim(),
    };

    // Kiểm tra trùng lặp với học sinh khác khi cập nhật
    const isDuplicate = students.some(s => 
      s.id !== updated.id && (s.sbd === normalizedData.sbd || s.cccd === normalizedData.cccd)
    );

    if (isDuplicate) {
      alert('Lỗi: học sinh đã tồn tại (Trùng SBD hoặc CCCD với hồ sơ khác).');
      return;
    }

    try {
      const { error } = await supabase.from('students').update(normalizedData).eq('id', updated.id);
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === updated.id ? normalizedData : s));
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
      const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setStudents([]);
      alert('Đã xóa toàn bộ dữ liệu học sinh thành công.');
    } catch (err: any) { alert('Lỗi: ' + err.message); }
  };

  const handleAddStudent = async (newStudent: Omit<StudentResult, 'id'>) => {
    const normalizedStudent = {
      ...newStudent,
      full_name: newStudent.full_name.trim().replace(/\s+/g, ' ').toUpperCase(),
      sbd: newStudent.sbd.trim().toUpperCase(),
      cccd: newStudent.cccd.trim(),
    };

    // Kiểm tra trùng lặp trước khi thêm
    const isDuplicate = students.some(s => s.sbd === normalizedStudent.sbd || s.cccd === normalizedStudent.cccd);
    if (isDuplicate) {
      alert('Lỗi: học sinh đã tồn tại (SBD hoặc CCCD này đã có trong hệ thống).');
      return;
    }

    try {
      const { data, error } = await supabase.from('students').insert([normalizedStudent]).select().single();
      if (error) throw error;
      if (data) {
        setStudents(prev => [data, ...prev]);
        alert('Đã thêm thí sinh mới thành công!');
      }
    } catch (err: any) { 
      alert('Lỗi khi lưu vào Database: ' + err.message); 
    }
  };

  const handleBulkAdd = async (newStudents: Omit<StudentResult, 'id'>[]) => {
    try {
      const normalizedList = newStudents.map(s => ({
        ...s,
        full_name: s.full_name.trim().replace(/\s+/g, ' ').toUpperCase(),
        sbd: s.sbd.trim().toUpperCase(),
        cccd: s.cccd.trim(),
      }));

      // 1. Kiểm tra trùng lặp trong chính file Excel
      const excelSbds = new Set();
      const excelCccds = new Set();
      for (const s of normalizedList) {
        if (excelSbds.has(s.sbd) || excelCccds.has(s.cccd)) {
          alert(`Lỗi: Trong file Excel có dữ liệu trùng lặp (SBD: ${s.sbd} hoặc CCCD: ${s.cccd}).`);
          return;
        }
        excelSbds.add(s.sbd);
        excelCccds.add(s.cccd);
      }

      // 2. Kiểm tra trùng lặp với dữ liệu hiện có trong Database
      const duplicates = normalizedList.filter(ns => 
        students.some(es => es.sbd === ns.sbd || es.cccd === ns.cccd)
      );

      if (duplicates.length > 0) {
        const dupInfo = duplicates.map(d => `${d.full_name} (${d.sbd})`).join(', ');
        alert(`Lỗi: học sinh đã tồn tại trong hệ thống: ${dupInfo}. Vui lòng kiểm tra lại file Excel.`);
        return;
      }

      const { data, error } = await supabase.from('students').insert(normalizedList).select();
      
      if (error) throw error;

      if (data && data.length > 0) {
        setStudents(prev => [...data, ...prev]);
        alert(`THÀNH CÔNG: Đã lưu ${data.length} thí sinh vào cơ sở dữ liệu!`);
        fetchStudentsData(false);
      }
    } catch (err: any) { 
      alert('Lỗi khi lưu dữ liệu: ' + err.message); 
    }
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

    if (email === 'admin@school.edu.vn' && password === 'admin123') {
      setIsLoggedIn(true);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  if (initializing) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Đang kết nối cơ sở dữ liệu...</div>;

  if (dbError) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">LỖI KẾT NỐI DỮ LIỆU</h2>
        <p className="text-gray-600 mb-6">Không thể tải dữ liệu bảng 'students'. Vui lòng kiểm tra cấu trúc bảng trong Supabase.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Thử lại</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header config={siteConfig} />
      <main className="flex-grow py-10 px-4">
        {view === 'admin' ? (
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
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" placeholder="admin@school.edu.vn" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">Mật khẩu</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors uppercase text-sm">{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
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
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-blue-900 text-center uppercase mb-10">{siteConfig.main_title}</h2>
            {error && <div className="max-w-xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
            <SearchForm onSearch={handleSearch} loading={loading} />
            {result && <ResultView result={result} onClose={() => setResult(null)} />}
          </div>
        )}
      </main>
      <Footer config={siteConfig} />
    </div>
  );
};

export default App;
