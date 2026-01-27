
import { StudentResult } from '../types';

export const MOCK_STUDENTS: StudentResult[] = [
  {
    id: "1",
    // Fix: fullName -> full_name
    full_name: "NGUYỄN VĂN AN",
    sbd: "HSG001",
    cccd: "001203004567",
    school: "THPT Chuyên Hà Nội - Amsterdam",
    subject: "Toán học",
    score: 18.5,
    award: "Giải Nhất"
  },
  {
    id: "2",
    // Fix: fullName -> full_name
    full_name: "TRẦN THỊ BÌNH",
    sbd: "HSG002",
    cccd: "001204001234",
    school: "THPT Chuyên Lê Hồng Phong",
    subject: "Vật lý",
    score: 16.0,
    award: "Giải Nhì"
  },
  {
    id: "3",
    // Fix: fullName -> full_name
    full_name: "LÊ HOÀNG NAM",
    sbd: "HSG003",
    cccd: "001205009876",
    school: "THPT Chuyên Lam Sơn",
    subject: "Hóa học",
    score: 14.25,
    award: "Giải Ba"
  },
  {
    id: "4",
    // Fix: fullName -> full_name
    full_name: "PHẠM MINH TUẤN",
    sbd: "HSG004",
    cccd: "001206001122",
    school: "THPT Chuyên Quốc Học Huế",
    subject: "Tin học",
    score: 19.0,
    award: "Giải Nhất"
  }
];