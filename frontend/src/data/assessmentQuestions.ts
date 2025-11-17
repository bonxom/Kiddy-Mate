import type { AssessmentQuestion } from '../types/auth.types';

export const assessmentQuestions: AssessmentQuestion[] = [
  // DISCIPLINE & SELF-DISCIPLINE (Kỷ luật & Thói quen Tự lập)
  {
    id: 'disc_1',
    category: 'discipline',
    question: 'Con có thể tự dọn dẹp đồ chơi sau khi chơi xong không?',
    description: 'Đánh giá khả năng tự quản lý đồ đạc cá nhân',
  },
  {
    id: 'disc_2',
    category: 'discipline',
    question: 'Con có thói quen đánh răng buổi sáng và tối không cần nhắc nhở?',
    description: 'Thói quen vệ sinh cá nhân',
  },
  {
    id: 'disc_3',
    category: 'discipline',
    question: 'Con có thể tự thức dậy đúng giờ và chuẩn bị đến trường?',
    description: 'Kỷ luật thời gian và tự lập',
  },
  {
    id: 'disc_4',
    category: 'discipline',
    question: 'Con có hoàn thành bài tập về nhà mà không cần giám sát liên tục?',
    description: 'Khả năng tự học và trách nhiệm',
  },
  {
    id: 'disc_5',
    category: 'discipline',
    question: 'Con có thể tự ăn sáng và chuẩn bị đồ ăn nhẹ đơn giản?',
    description: 'Kỹ năng tự phục vụ',
  },

  // EMOTIONAL INTELLIGENCE (Trí tuệ Cảm xúc)
  {
    id: 'emo_1',
    category: 'emotional',
    question: 'Con có nhận biết và diễn đạt cảm xúc của mình một cách rõ ràng?',
    description: 'Nhận thức cảm xúc bản thân',
  },
  {
    id: 'emo_2',
    category: 'emotional',
    question: 'Con có thể tự an ủi khi buồn hoặc thất vọng?',
    description: 'Khả năng điều chỉnh cảm xúc',
  },
  {
    id: 'emo_3',
    category: 'emotional',
    question: 'Con có đồng cảm với cảm xúc của người khác (bạn bè, anh chị em)?',
    description: 'Trí tuệ xã hội và đồng cảm',
  },
  {
    id: 'emo_4',
    category: 'emotional',
    question: 'Con có xử lý tốt khi bị từ chối hoặc không được như ý?',
    description: 'Chống chịu với thất bại',
  },
  {
    id: 'emo_5',
    category: 'emotional',
    question: 'Con có chia sẻ cảm xúc với bố mẹ khi có vấn đề?',
    description: 'Giao tiếp cảm xúc trong gia đình',
  },

  // SOCIAL SKILLS & INTERACTION (Kỹ năng Xã hội & Tương tác)
  {
    id: 'social_1',
    category: 'social',
    question: 'Con có dễ dàng kết bạn mới tại trường hoặc nơi vui chơi?',
    description: 'Khả năng giao tiếp xã hội',
  },
  {
    id: 'social_2',
    category: 'social',
    question: 'Con có biết chia sẻ đồ chơi và hợp tác khi chơi nhóm?',
    description: 'Kỹ năng làm việc nhóm',
  },
  {
    id: 'social_3',
    category: 'social',
    question: 'Con có lắng nghe khi người khác nói và chờ đến lượt mình?',
    description: 'Kỹ năng giao tiếp hai chiều',
  },
  {
    id: 'social_4',
    category: 'social',
    question: 'Con có giải quyết xung đột với bạn bè một cách hòa bình?',
    description: 'Giải quyết vấn đề xã hội',
  },
  {
    id: 'social_5',
    category: 'social',
    question: 'Con có tôn trọng quy tắc và hướng dẫn của người lớn?',
    description: 'Tuân thủ quy tắc xã hội',
  },
];

export const favoriteTopicOptions = [
  { id: 'animals', label: '🦁 Động vật', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'space', label: '🚀 Vũ trụ', color: 'bg-purple-100 text-purple-700' },
  { id: 'art', label: '🎨 Nghệ thuật', color: 'bg-pink-100 text-pink-700' },
  { id: 'sports', label: '⚽ Thể thao', color: 'bg-green-100 text-green-700' },
  { id: 'music', label: '🎵 Âm nhạc', color: 'bg-blue-100 text-blue-700' },
  { id: 'science', label: '🔬 Khoa học', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'reading', label: '📚 Đọc sách', color: 'bg-orange-100 text-orange-700' },
  { id: 'cooking', label: '🍳 Nấu ăn', color: 'bg-red-100 text-red-700' },
  { id: 'nature', label: '🌳 Thiên nhiên', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'tech', label: '💻 Công nghệ', color: 'bg-indigo-100 text-indigo-700' },
];

export const ratingLabels = [
  { value: 1, label: 'Rất khó khăn', emoji: '😟', color: 'text-red-600' },
  { value: 2, label: 'Khó khăn', emoji: '😕', color: 'text-orange-600' },
  { value: 3, label: 'Trung bình', emoji: '😐', color: 'text-yellow-600' },
  { value: 4, label: 'Tốt', emoji: '🙂', color: 'text-green-600' },
  { value: 5, label: 'Xuất sắc', emoji: '😊', color: 'text-blue-600' },
];
