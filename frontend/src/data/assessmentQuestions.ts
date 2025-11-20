import type { AssessmentQuestion } from '../types/auth.types';

// ========== PHẦN A: BỘ CÂU HỎI CHUYÊN SÂU (NHÓM 6-10 TUỔI / CẤP 1) ==========
// Mục tiêu: Đánh giá các thói quen nền tảng, khả năng kiểm soát cảm xúc cơ bản, và kỹ năng chơi/tương tác với bạn bè
export const assessmentQuestionsPrimary: AssessmentQuestion[] = [
  // MẢNG 1: KỶ LUẬT & THÓI QUEN TỰ LẬP
  // Đánh giá khả năng tự quản lý bản thân và tuân thủ các quy tắc cơ bản
  {
    id: 'p_disc_1',
    category: 'discipline',
    question: 'Bé có tự giác hoàn thành các việc cá nhân (đánh răng, thay đồ) mà không cần nhắc nhở nhiều lần không?',
    description: 'Đánh giá thói quen tự chăm sóc bản thân',
  },
  {
    id: 'p_disc_2',
    category: 'discipline',
    question: 'Bé có giữ gìn góc học tập/phòng chơi của mình gọn gàng, tự cất đồ chơi/sách vở sau khi dùng xong không?',
    description: 'Đánh giá ý thức tự quản lý không gian cá nhân',
  },
  {
    id: 'p_disc_3',
    category: 'discipline',
    question: 'Khi được giao một việc nhà đơn giản (ví dụ: lau bàn, cho thú cưng ăn), bé có hoàn thành đến cùng không?',
    description: 'Đánh giá trách nhiệm với nhiệm vụ được giao',
  },
  {
    id: 'p_disc_4',
    category: 'discipline',
    question: 'Bé có tuân thủ các quy tắc về thời gian sử dụng thiết bị điện tử (TV/iPad) mà gia đình đặt ra không?',
    description: 'Đánh giá khả năng tuân thủ quy tắc công nghệ',
  },
  {
    id: 'p_disc_5',
    category: 'discipline',
    question: 'Bé có gặp khó khăn khi phải chuyển từ một hoạt động yêu thích (như xem TV) sang một hoạt động khác (như đi tắm) không?',
    description: 'Đánh giá tính linh hoạt trong chuyển đổi hoạt động (câu hỏi ngược)',
  },

  // MẢNG 2: TRÍ TUỆ CẢM XÚC
  // Đánh giá khả năng nhận biết, gọi tên và kiểm soát cảm xúc cơ bản
  {
    id: 'p_emo_1',
    category: 'emotional',
    question: 'Khi bé cảm thấy thất vọng hoặc tức giận (ví dụ: thua một trò chơi), bé có biểu hiện la hét, ném đồ hoặc đánh người khác không?',
    description: 'Đánh giá kiểm soát cảm xúc tiêu cực (câu hỏi ngược)',
  },
  {
    id: 'p_emo_2',
    category: 'emotional',
    question: 'Bé có thể diễn đạt cảm xúc của mình bằng lời (ví dụ: "Con đang buồn", "Con đang tức") thay vì chỉ khóc hoặc cáu kỉnh không?',
    description: 'Đánh giá khả năng nhận diện và diễn đạt cảm xúc',
  },
  {
    id: 'p_emo_3',
    category: 'emotional',
    question: 'Bé có biểu hiện đồng cảm (ví dụ: cố gắng dỗ dành) khi thấy bạn bè hoặc người thân đang buồn hoặc bị đau không?',
    description: 'Đánh giá sự đồng cảm và quan tâm người khác',
  },
  {
    id: 'p_emo_4',
    category: 'emotional',
    question: 'Bé có có vẻ lo lắng thái quá về những việc nhỏ nhặt hoặc về việc đi học không?',
    description: 'Đánh giá mức độ lo âu (câu hỏi ngược)',
  },
  {
    id: 'p_emo_5',
    category: 'emotional',
    question: 'Khi bé làm sai điều gì, bé có dũng cảm nhận lỗi hay có xu hướng đổ lỗi cho người khác/hoàn cảnh?',
    description: 'Đánh giá trách nhiệm cá nhân và sự trung thực',
  },

  // MẢNG 3: KỸ NĂNG XÃ HỘI & TƯƠNG TÁC
  // Đánh giá khả năng kết bạn, duy trì mối quan hệ và giải quyết xung đột
  {
    id: 'p_social_1',
    category: 'social',
    question: 'Bé có dễ dàng tham gia vào một nhóm bạn đang chơi và tự tin kết bạn mới không?',
    description: 'Đánh giá sự tự tin trong giao tiếp xã hội',
  },
  {
    id: 'p_social_2',
    category: 'social',
    question: 'Trong khi chơi nhóm, bé có biết cách chia sẻ đồ chơi và chờ đến lượt mình không?',
    description: 'Đánh giá kỹ năng hợp tác và chia sẻ',
  },
  {
    id: 'p_social_3',
    category: 'social',
    question: 'Khi xảy ra tranh cãi với bạn, bé có xu hướng giải quyết bằng lời nói hay dùng bạo lực (xô đẩy, đánh bạn)?',
    description: 'Đánh giá kỹ năng giải quyết xung đột',
  },
  {
    id: 'p_social_4',
    category: 'social',
    question: 'Bé có vẻ thích chơi một mình hơn là chơi với các bạn khác không?',
    description: 'Đánh giá xu hướng xã hội vs độc lập (câu hỏi ngược)',
  },
  {
    id: 'p_social_5',
    category: 'social',
    question: 'Bé có biết cách nhờ sự giúp đỡ (từ bạn bè hoặc người lớn) một cách lịch sự khi gặp khó khăn không?',
    description: 'Đánh giá kỹ năng tìm kiếm hỗ trợ',
  },
];

// ========== PHẦN B: BỘ CÂU HỎI CHUYÊN SÂU (NHÓM 11-14 TUỔI / CẤP 2) ==========
// Mục tiêu: Đánh giá tính tự chủ, đời sống nội tâm, khả năng quản lý các mối quan hệ xã hội phức tạp và khả năng thích ứng với căng thẳng
export const assessmentQuestionsSecondary: AssessmentQuestion[] = [
  // MẢNG 1: TÍNH TỰ CHỦ & TRÁCH NHIỆM
  // Đánh giá khả năng tự quản lý học tập, thời gian và các cam kết cá nhân
  {
    id: 's_auto_1',
    category: 'discipline',
    question: 'Bé có tự giác lập kế hoạch và hoàn thành bài tập về nhà mà không cần phụ huynh giám sát/nhắc nhở liên tục không?',
    description: 'Đánh giá tính tự chủ trong học tập',
  },
  {
    id: 's_auto_2',
    category: 'discipline',
    question: 'Bé có khả năng tự quản lý thời gian của mình (cân bằng giữa học tập, giải trí, và các hoạt động ngoại khóa) không?',
    description: 'Đánh giá kỹ năng quản lý thời gian',
  },
  {
    id: 's_auto_3',
    category: 'discipline',
    question: 'Bé có hay trì hoãn các nhiệm vụ quan trọng (ví dụ: học bài thi) đến phút cuối cùng không?',
    description: 'Đánh giá xu hướng trì hoãn (câu hỏi ngược)',
  },
  {
    id: 's_auto_4',
    category: 'discipline',
    question: 'Bé có giữ lời hứa và hoàn thành các cam kết (với gia đình, bạn bè) một cách đáng tin cậy không?',
    description: 'Đánh giá sự trung thực và đáng tin cậy',
  },

  // MẢNG 2: KỸ NĂNG XÃ HỘI & QUAN HỆ BẠN BÈ
  // Đánh giá tầm quan trọng của bạn bè, khả năng xử lý áp lực và xung đột
  {
    id: 's_social_1',
    category: 'social',
    question: 'Bạn bè có vẻ như là ưu tiên hàng đầu và có ảnh hưởng lớn đến các quyết định/sở thích của bé không?',
    description: 'Đánh giá ảnh hưởng của đồng trang lứa',
  },
  {
    id: 's_social_2',
    category: 'social',
    question: 'Bé có kể cho bạn nghe về những áp lực đồng trang lứa (peer pressure) mà bé gặp phải không (ví dụ: bị rủ rê làm điều sai trái)?',
    description: 'Đánh giá mức độ cởi mở về áp lực bạn bè',
  },
  {
    id: 's_social_3',
    category: 'social',
    question: 'Bạn có nhận thấy bé có dấu hiệu bị bắt nạt (ví dụ: không muốn đi học, mất đồ, buồn bã không rõ lý do) hoặc đang bắt nạt người khác không?',
    description: 'Đánh giá dấu hiệu bắt nạt (câu hỏi ngược)',
  },
  {
    id: 's_social_4',
    category: 'social',
    question: 'Bé có thể duy trì các mối quan hệ bạn bè lành mạnh, hay thường xuyên xảy ra xung đột, "drama" với bạn bè?',
    description: 'Đánh giá chất lượng mối quan hệ bạn bè',
  },
  {
    id: 's_social_5',
    category: 'social',
    question: 'Bé có thể hiện sự đồng cảm và quan điểm rõ ràng khi thảo luận về các vấn đề xã hội không?',
    description: 'Đánh giá tư duy xã hội và sự trưởng thành',
  },

  // MẢNG 3: GIAO TIẾP & ĐỜI SỐNG NỘI TÂM
  // Đánh giá mức độ cởi mở và khả năng xử lý các cảm xúc phức tạp
  {
    id: 's_comm_1',
    category: 'emotional',
    question: 'Khi bé gặp chuyện không vui hoặc căng thẳng, bé có chủ động chia sẻ với bạn hay có xu hướng giấu kín và tự giải quyết?',
    description: 'Đánh giá mức độ cởi mở với gia đình',
  },
  {
    id: 's_comm_2',
    category: 'emotional',
    question: 'Bạn có cảm thấy bé "đóng cửa" và ít giao tiếp với gia đình hơn trước, thay vào đó dành nhiều thời gian cho bạn bè hoặc ở một mình không?',
    description: 'Đánh giá xu hướng rời xa gia đình (câu hỏi ngược)',
  },
  {
    id: 's_comm_3',
    category: 'emotional',
    question: 'Bé có biểu hiện các dấu hiệu căng thẳng (stress) rõ rệt (ví dụ: rối loạn giấc ngủ, cáu gắt, thay đổi thói quen ăn uống) không?',
    description: 'Đánh giá dấu hiệu căng thẳng tâm lý (câu hỏi ngược)',
  },
  {
    id: 's_comm_4',
    category: 'emotional',
    question: 'Bé phản ứng thế nào với thất bại (ví dụ: điểm kém)? Bé có thể vực dậy hay chìm trong thất vọng, tự trách bản thân?',
    description: 'Đánh giá khả năng phục hồi (resilience)',
  },
  {
    id: 's_comm_5',
    category: 'emotional',
    question: 'Bé có hay so sánh bản thân với người khác (bạn bè, người nổi tiếng trên mạng) và cảm thấy tự ti không?',
    description: 'Đánh giá lòng tự trọng và hình ảnh bản thân (câu hỏi ngược)',
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