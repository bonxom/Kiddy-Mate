import type { AssessmentQuestion } from '../types/auth.types';

// --- BỘ CÂU HỎI CHO NHÓM 6-10 TUỔI (CẤP 1) ---
export const assessmentQuestionsPrimary: AssessmentQuestion[] = [
  // 1. KỶ LUẬT & TỰ LẬP (Discipline)
  {
    id: 'p_disc_1',
    category: 'discipline',
    question: 'Con có tự giác vệ sinh cá nhân (đánh răng, thay đồ) mà không cần nhắc nhở nhiều lần?',
    description: 'Thói quen vệ sinh cá nhân',
  },
  {
    id: 'p_disc_2',
    category: 'discipline',
    question: 'Con có chủ động cất dọn đồ chơi hoặc sách vở sau khi sử dụng xong?',
    description: 'Ý thức gọn gàng và ngăn nắp',
  },
  {
    id: 'p_disc_3',
    category: 'discipline',
    question: 'Khi được giao một việc nhỏ (ví dụ: lau bàn), con có hoàn thành đến cùng không?',
    description: 'Trách nhiệm với nhiệm vụ được giao',
  },
  {
    id: 'p_disc_4',
    category: 'discipline',
    question: 'Con có tuân thủ quy định về thời gian xem TV/iPad mà gia đình đặt ra?',
    description: 'Tuân thủ quy tắc màn hình',
  },

  // 2. TRÍ TUỆ CẢM XÚC (Emotional)
  {
    id: 'p_emo_1',
    category: 'emotional',
    question: 'Khi tức giận hoặc thất vọng, con có thể diễn đạt bằng lời thay vì la hét/ném đồ?',
    description: 'Kiểm soát hành vi tiêu cực',
  },
  {
    id: 'p_emo_2',
    category: 'emotional',
    question: 'Con có nhận biết và gọi tên được cảm xúc của mình (vui, buồn, sợ, tức)?',
    description: 'Nhận thức cảm xúc bản thân',
  },
  {
    id: 'p_emo_3',
    category: 'emotional',
    question: 'Con có biết an ủi hoặc chia sẻ khi thấy bạn bè/người thân bị buồn hoặc đau?',
    description: 'Sự đồng cảm cơ bản',
  },

  // 3. KỸ NĂNG XÃ HỘI (Social)
  {
    id: 'p_social_1',
    category: 'social',
    question: 'Con có dễ dàng tham gia vào nhóm bạn và tự tin kết bạn mới?',
    description: 'Sự tự tin trong giao tiếp',
  },
  {
    id: 'p_social_2',
    category: 'social',
    question: 'Khi chơi nhóm, con có biết chia sẻ đồ chơi và chờ đến lượt mình?',
    description: 'Kỹ năng hợp tác và chia sẻ',
  },
  {
    id: 'p_social_3',
    category: 'social',
    question: 'Con có biết cách nhờ người lớn giúp đỡ một cách lịch sự khi gặp khó khăn?',
    description: 'Kỹ năng tìm kiếm sự hỗ trợ',
  },
];

// --- BỘ CÂU HỎI CHO NHÓM 11-14 TUỔI (CẤP 2) ---
export const assessmentQuestionsSecondary: AssessmentQuestion[] = [
  // 1. TÍNH TỰ CHỦ & TRÁCH NHIỆM (Autonomy)
  {
    id: 's_auto_1',
    category: 'discipline',
    question: 'Con có tự lập kế hoạch và hoàn thành bài tập về nhà mà không cần giám sát liên tục?',
    description: 'Tự quản lý học tập',
  },
  {
    id: 's_auto_2',
    category: 'discipline',
    question: 'Con có khả năng tự sắp xếp thời gian cân bằng giữa học và giải trí?',
    description: 'Kỹ năng quản lý thời gian',
  },
  {
    id: 's_auto_3',
    category: 'discipline',
    question: 'Con có giữ lời hứa và hoàn thành các cam kết với gia đình/bạn bè?',
    description: 'Sự đáng tin cậy',
  },

  // 2. ĐỜI SỐNG NỘI TÂM (Inner Self)
  {
    id: 's_inner_1',
    category: 'emotional',
    question: 'Khi gặp chuyện căng thẳng, con có chủ động chia sẻ với bố mẹ không?',
    description: 'Mức độ cởi mở với gia đình',
  },
  {
    id: 's_inner_2',
    category: 'emotional',
    question: 'Con phản ứng thế nào với thất bại (ví dụ: điểm kém)? (Điểm cao = Tự vực dậy tốt)',
    description: 'Khả năng phục hồi (Resilience)',
  },
  {
    id: 's_inner_3',
    category: 'emotional',
    question: 'Con có thường xuyên so sánh bản thân với người khác và cảm thấy tự ti?',
    description: 'Sự tự tin và hình ảnh bản thân',
  },

  // 3. XÃ HỘI & BẠN BÈ (Social & Peers)
  {
    id: 's_social_1',
    category: 'social',
    question: 'Con có duy trì được các mối quan hệ bạn bè lành mạnh, ít xung đột kịch tính?',
    description: 'Chất lượng mối quan hệ bạn bè',
  },
  {
    id: 's_social_2',
    category: 'social',
    question: 'Con có đủ bản lĩnh để từ chối khi bị bạn bè rủ rê làm điều sai trái?',
    description: 'Xử lý áp lực đồng trang lứa',
  },
  {
    id: 's_social_3',
    category: 'social',
    question: 'Con có thể hiện quan điểm cá nhân rõ ràng và tôn trọng quan điểm người khác?',
    description: 'Tư duy phản biện xã hội',
  },
];

// --- TÙY CHỌN SỞ THÍCH (Cập nhật cho đa dạng lứa tuổi) ---
export const favoriteTopicOptions = [
  { id: 'animals', label: '🦁 Động vật & Khủng long', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'superhero', label: '⚡ Siêu anh hùng', color: 'bg-red-100 text-red-700' },
  { id: 'space', label: '🚀 Vũ trụ & Khoa học', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'art', label: '🎨 Vẽ & Sáng tạo', color: 'bg-pink-100 text-pink-700' },
  { id: 'sports', label: '⚽ Thể thao & Vận động', color: 'bg-green-100 text-green-700' },
  { id: 'music', label: '🎵 Âm nhạc & Nhảy', color: 'bg-blue-100 text-blue-700' },
  { id: 'coding', label: '💻 Lập trình & Game', color: 'bg-slate-100 text-slate-700' },
  { id: 'cooking', label: '🍳 Nấu ăn & Làm bánh', color: 'bg-orange-100 text-orange-700' },
  { id: 'reading', label: '📚 Đọc sách & Truyện', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'fashion', label: '👗 Thời trang & Làm đẹp', color: 'bg-purple-100 text-purple-700' },
];

// --- THANG ĐO ĐÁNH GIÁ (Chuyển sang Tần suất để chính xác hơn) ---
export const ratingLabels = [
  { value: 1, label: 'Hầu như không', emoji: '⚪', color: 'text-gray-500' },
  { value: 2, label: 'Hiếm khi', emoji: '🟠', color: 'text-orange-500' },
  { value: 3, label: 'Thỉnh thoảng', emoji: '🟡', color: 'text-yellow-600' },
  { value: 4, label: 'Thường xuyên', emoji: '🟢', color: 'text-green-600' },
  { value: 5, label: 'Luôn luôn', emoji: '🌟', color: 'text-blue-600' },
];