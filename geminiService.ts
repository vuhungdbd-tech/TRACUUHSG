
import { GoogleGenAI } from "@google/genai";
import { AppConfig } from "./types";

const MODEL_NAME = "gemini-3-pro-preview";

export const generateExamContent = async (config: AppConfig, step: number, context?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const isFrequent = config.examType === 'Đề thường xuyên';
  
  const systemInstruction = `
    Bạn là một chuyên gia khảo thí và đo lường giáo dục Việt Nam bậc nhất.
    Nhiệm vụ: Tạo hồ sơ kiểm tra chuẩn Công văn 7991.
    Ngôn ngữ: Tiếng Việt.
    Loại đề: ${config.examType}.
    
    QUY TẮC ĐỊNH DẠNG NGHIÊM NGẶT:
    1. Tuyệt đối KHÔNG có lời chào, lời dẫn, hay kết luận của AI.
    2. Chỉ trả về nội dung chính của bước được yêu cầu.
    3. KHÔNG sử dụng ký hiệu markdown **. Sử dụng thẻ HTML <b> hoặc <strong> để bôi đậm.
    4. KHÔNG để dòng trống thừa. Các đoạn văn, câu hỏi phải sát nhau, chỉ cách nhau 1 lần xuống dòng duy nhất nếu cần thiết.
    5. Cỡ chữ mặc định: 13pt. Font: Times New Roman. Dãn dòng đơn (Single spacing).
    6. Công thức Toán học: Viết dưới dạng LaTeX hoặc ký hiệu toán học chuẩn xác, rõ ràng để có thể hiển thị như Equation.
    7. Ma trận và Bản đặc tả: Sử dụng bảng HTML <table> có border="1", cellpadding="5".
    8. Đáp án Trắc nghiệm: Kẻ bảng HTML 2 cột (Câu | Đáp án).
    
    TÍNH THỐNG NHẤT: Nội dung kiến thức và số lượng câu hỏi trong Đề thi PHẢI khớp hoàn toàn với Ma trận và Bản đặc tả (nếu có) hoặc khớp với nội dung kiến thức được cung cấp.
    
    Thông tin chung:
    - Môn: ${config.subject}, Lớp: ${config.grade}, Sách: ${config.textbook}
    - Thời gian: ${config.duration} phút
    - Tỷ lệ NB:TH:VD:VDC = ${config.cognitive.nb}:${config.cognitive.th}:${config.cognitive.vd}:${config.cognitive.vdc}
  `;

  let prompt = "";

  switch (step) {
    case 1:
      prompt = `Hãy tạo MA TRẬN ĐỀ KIỂM TRA cho nội dung: ${config.topics}.
      Tiêu đề: <h1>MA TRẬN MÔN ${config.subject.toUpperCase()} LỚP ${config.grade}</h1>
      Yêu cầu: Trả về bảng HTML. Không dòng trống thừa. Phân bổ đúng ${config.structure.multipleChoice.count} TN, ${config.structure.trueFalse.count} Đ/S, ${config.structure.shortAnswer.count} TLN, ${config.structure.essay.count} TL.`;
      break;
    case 2:
      prompt = `Dựa trên Ma trận: ${context}, lập BẢN ĐẶC TẢ ĐỀ KIỂM TRA.
      Tiêu đề: <h1>BẢN ĐẶC TẢ MÔN: ${config.subject.toUpperCase()} LỚP ${config.grade}</h1>
      Yêu cầu: Trả về bảng HTML. Không lời dẫn. Không dòng trống thừa.`;
      break;
    case 3:
      const examContext = isFrequent 
        ? `NỘI DUNG KIẾN THỨC: ${config.topics}\nCẤU TRÚC: ${config.structure.multipleChoice.count} TN, ${config.structure.trueFalse.count} Đ/S, ${config.structure.shortAnswer.count} TLN, ${config.structure.essay.count} TL.`
        : `Dựa trên MA TRẬN và BẢN ĐẶC TẢ: ${context}`;
        
      prompt = `${examContext}, soạn ĐỀ KIỂM TRA chính thức.
      Yêu cầu:
      - Chỉ hiển thị nội dung ĐỀ KIỂM TRA (Phần I, II, III, IV).
      - KHÔNG kèm ma trận, đặc tả hay đáp án.
      - Các câu hỏi trình bày sát nhau, không dòng trống thừa.
      - Công thức toán học trình bày đẹp.`;
      break;
    case 4:
      prompt = `Hãy soạn ĐÁP ÁN VÀ BIỂU ĐIỂM cho đề: ${context}.
      Yêu cầu:
      - Trắc nghiệm kẻ bảng HTML.
      - Tự luận và TLN có biểu điểm chi tiết.
      - Không dòng trống thừa.`;
      break;
    default:
      prompt = "";
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2,
    }
  });

  return response.text || "Có lỗi xảy ra.";
};
