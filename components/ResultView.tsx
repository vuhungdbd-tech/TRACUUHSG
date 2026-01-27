
import React from 'react';
import { StudentResult } from '../types';

interface ResultViewProps {
  result: StudentResult;
  onClose: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onClose }) => {
  return (
    <div className="w-full max-w-xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase">Kết quả tra cứu</h3>
          <button onClick={onClose}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 border-b py-2"><span className="font-bold text-gray-500 uppercase text-xs">Họ và tên</span><span className="font-black text-blue-900 uppercase">{result.full_name}</span></div>
          <div className="grid grid-cols-2 border-b py-2"><span className="font-bold text-gray-500 uppercase text-xs">SBD</span><span className="font-bold">{result.sbd}</span></div>
          <div className="grid grid-cols-2 border-b py-2"><span className="font-bold text-gray-500 uppercase text-xs">Trường</span><span className="font-medium">{result.school}</span></div>
          <div className="grid grid-cols-2 border-b py-2"><span className="font-bold text-gray-500 uppercase text-xs">Môn thi</span><span className="font-bold text-blue-700">{result.subject}</span></div>
          <div className="grid grid-cols-2 border-b py-2"><span className="font-bold text-gray-500 uppercase text-xs">Điểm</span><span className="font-black text-xl">{result.score}</span></div>
          <div className="grid grid-cols-2 py-2"><span className="font-bold text-gray-500 uppercase text-xs">Xếp giải</span><span className="font-black text-red-600 uppercase italic">{result.award}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
