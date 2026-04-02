import i18n from '../i18n';
import { normalizeLanguage, type AppLanguage } from '../i18n/language';
import type { AssessmentQuestion } from '../types/auth.types';

type LocalizedText = Record<AppLanguage, string>;

interface LocalizedAssessmentQuestion {
  id: string;
  category: AssessmentQuestion['category'];
  question: LocalizedText;
  description?: LocalizedText;
}

interface LocalizedOption {
  id: string;
  label: LocalizedText;
  color: string;
}

interface LocalizedRatingLabel {
  value: number;
  label: LocalizedText;
  emoji: string;
  color: string;
}

const resolveLanguage = (language?: AppLanguage): AppLanguage =>
  normalizeLanguage(language ?? i18n.resolvedLanguage ?? i18n.language);

const localizeText = (value: LocalizedText, language?: AppLanguage): string => value[resolveLanguage(language)];

const mapQuestions = (
  questions: LocalizedAssessmentQuestion[],
  language?: AppLanguage
): AssessmentQuestion[] =>
  questions.map((question) => ({
    id: question.id,
    category: question.category,
    question: localizeText(question.question, language),
    description: question.description ? localizeText(question.description, language) : undefined,
  }));

const PRIMARY_QUESTIONS: LocalizedAssessmentQuestion[] = [
  {
    id: 'p_disc_1',
    category: 'discipline',
    question: {
      en: 'Can your child complete personal routines like brushing teeth or changing clothes without repeated reminders?',
      vi: 'Bé có tự giác hoàn thành các việc cá nhân như đánh răng hoặc thay đồ mà không cần nhắc nhiều lần không?',
    },
  },
  {
    id: 'p_disc_2',
    category: 'discipline',
    question: {
      en: 'Does your child keep their study corner or play area tidy after finishing an activity?',
      vi: 'Bé có giữ góc học tập hoặc khu vực chơi của mình gọn gàng sau khi dùng xong không?',
    },
  },
  {
    id: 'p_disc_3',
    category: 'discipline',
    question: {
      en: 'When given a simple household task, does your child usually finish it?',
      vi: 'Khi được giao một việc nhà đơn giản, bé có thường hoàn thành đến cùng không?',
    },
  },
  {
    id: 'p_disc_4',
    category: 'discipline',
    question: {
      en: 'Does your child follow the family rules for screen time?',
      vi: 'Bé có tuân thủ các quy tắc của gia đình về thời gian sử dụng thiết bị điện tử không?',
    },
  },
  {
    id: 'p_disc_5',
    category: 'discipline',
    question: {
      en: 'Does your child struggle when switching from a favorite activity to another routine?',
      vi: 'Bé có gặp khó khăn khi phải chuyển từ một hoạt động yêu thích sang hoạt động khác không?',
    },
  },
  {
    id: 'p_emo_1',
    category: 'emotional',
    question: {
      en: 'When upset or frustrated, does your child scream, throw things, or hit others?',
      vi: 'Khi thất vọng hoặc tức giận, bé có la hét, ném đồ hoặc đánh người khác không?',
    },
  },
  {
    id: 'p_emo_2',
    category: 'emotional',
    question: {
      en: 'Can your child describe feelings with words instead of only crying or sulking?',
      vi: 'Bé có thể diễn đạt cảm xúc bằng lời thay vì chỉ khóc hoặc cáu gắt không?',
    },
  },
  {
    id: 'p_emo_3',
    category: 'emotional',
    question: {
      en: 'Does your child show empathy when a friend or family member is sad or hurt?',
      vi: 'Bé có thể hiện sự đồng cảm khi thấy bạn bè hoặc người thân buồn hay bị đau không?',
    },
  },
  {
    id: 'p_emo_4',
    category: 'emotional',
    question: {
      en: 'Does your child worry too much about small things or about going to school?',
      vi: 'Bé có lo lắng quá nhiều về những việc nhỏ hoặc về chuyện đi học không?',
    },
  },
  {
    id: 'p_emo_5',
    category: 'emotional',
    question: {
      en: 'When your child makes a mistake, can they admit it instead of blaming others?',
      vi: 'Khi làm sai, bé có dám nhận lỗi thay vì đổ lỗi cho người khác hoặc hoàn cảnh không?',
    },
  },
  {
    id: 'p_social_1',
    category: 'social',
    question: {
      en: 'Can your child confidently join a group and make new friends?',
      vi: 'Bé có dễ dàng tham gia vào một nhóm bạn đang chơi và tự tin kết bạn mới không?',
    },
  },
  {
    id: 'p_social_2',
    category: 'social',
    question: {
      en: 'During group play, can your child share and wait for their turn?',
      vi: 'Trong khi chơi nhóm, bé có biết chia sẻ và chờ đến lượt mình không?',
    },
  },
  {
    id: 'p_social_3',
    category: 'social',
    question: {
      en: 'When conflict happens with friends, does your child use words instead of force?',
      vi: 'Khi xảy ra tranh cãi với bạn, bé có xu hướng giải quyết bằng lời nói thay vì dùng bạo lực không?',
    },
  },
  {
    id: 'p_social_4',
    category: 'social',
    question: {
      en: 'Does your child usually prefer playing alone rather than with other children?',
      vi: 'Bé có xu hướng thích chơi một mình hơn là chơi với các bạn khác không?',
    },
  },
  {
    id: 'p_social_5',
    category: 'social',
    question: {
      en: 'Can your child politely ask for help from adults or friends when needed?',
      vi: 'Bé có biết cách nhờ bạn bè hoặc người lớn giúp đỡ một cách lịch sự khi gặp khó khăn không?',
    },
  },
];

const SECONDARY_QUESTIONS: LocalizedAssessmentQuestion[] = [
  {
    id: 's_auto_1',
    category: 'discipline',
    question: {
      en: 'Can your child plan and finish homework without constant supervision?',
      vi: 'Bé có thể tự lập kế hoạch và hoàn thành bài tập mà không cần nhắc nhở liên tục không?',
    },
  },
  {
    id: 's_auto_2',
    category: 'discipline',
    question: {
      en: 'Can your child balance study time, entertainment, and extracurricular activities?',
      vi: 'Bé có khả năng cân bằng giữa học tập, giải trí và hoạt động ngoại khóa không?',
    },
  },
  {
    id: 's_auto_3',
    category: 'discipline',
    question: {
      en: 'Does your child often procrastinate important tasks until the last minute?',
      vi: 'Bé có thường trì hoãn những nhiệm vụ quan trọng đến phút cuối không?',
    },
  },
  {
    id: 's_auto_4',
    category: 'discipline',
    question: {
      en: 'Does your child usually keep promises and fulfill commitments?',
      vi: 'Bé có thường giữ lời hứa và hoàn thành các cam kết của mình không?',
    },
  },
  {
    id: 's_social_1',
    category: 'social',
    question: {
      en: 'Do friends strongly influence your child’s decisions and preferences?',
      vi: 'Bạn bè có ảnh hưởng lớn đến các quyết định và sở thích của bé không?',
    },
  },
  {
    id: 's_social_2',
    category: 'social',
    question: {
      en: 'Does your child talk openly about peer pressure or uncomfortable social situations?',
      vi: 'Bé có chia sẻ về áp lực đồng trang lứa hoặc những tình huống xã hội khiến mình khó xử không?',
    },
  },
  {
    id: 's_social_3',
    category: 'social',
    question: {
      en: 'Do you notice any signs that your child may be bullied or bullying others?',
      vi: 'Bạn có nhận thấy dấu hiệu bé bị bắt nạt hoặc đang bắt nạt người khác không?',
    },
  },
  {
    id: 's_social_4',
    category: 'social',
    question: {
      en: 'Can your child maintain healthy friendships without frequent drama or conflict?',
      vi: 'Bé có thể duy trì các mối quan hệ bạn bè lành mạnh mà không thường xuyên xảy ra xung đột không?',
    },
  },
  {
    id: 's_social_5',
    category: 'social',
    question: {
      en: 'Can your child show empathy and a clear point of view when discussing social issues?',
      vi: 'Bé có thể thể hiện sự đồng cảm và quan điểm rõ ràng khi bàn về các vấn đề xã hội không?',
    },
  },
  {
    id: 's_comm_1',
    category: 'emotional',
    question: {
      en: 'When something stressful happens, does your child share it or keep it to themselves?',
      vi: 'Khi gặp chuyện căng thẳng, bé có chủ động chia sẻ hay có xu hướng giữ trong lòng?',
    },
  },
  {
    id: 's_comm_2',
    category: 'emotional',
    question: {
      en: 'Do you feel your child has become more withdrawn from family than before?',
      vi: 'Bạn có cảm thấy bé ít giao tiếp với gia đình hơn trước và dành nhiều thời gian cho bạn bè hoặc ở một mình không?',
    },
  },
  {
    id: 's_comm_3',
    category: 'emotional',
    question: {
      en: 'Does your child show clear signs of stress such as sleep changes, irritability, or appetite changes?',
      vi: 'Bé có biểu hiện căng thẳng rõ rệt như rối loạn giấc ngủ, cáu gắt hoặc thay đổi thói quen ăn uống không?',
    },
  },
  {
    id: 's_comm_4',
    category: 'emotional',
    question: {
      en: 'How does your child react to failure, such as a low score or losing a competition?',
      vi: 'Bé phản ứng thế nào với thất bại, chẳng hạn điểm kém hoặc thua cuộc?',
    },
  },
  {
    id: 's_comm_5',
    category: 'emotional',
    question: {
      en: 'Does your child compare themselves with others and feel insecure about it?',
      vi: 'Bé có hay so sánh bản thân với người khác và cảm thấy tự ti vì điều đó không?',
    },
  },
];

const FAVORITE_TOPICS: LocalizedOption[] = [
  { id: 'animals', label: { en: 'Animals & Dinosaurs', vi: 'Động vật & Khủng long' }, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'superhero', label: { en: 'Superheroes', vi: 'Siêu anh hùng' }, color: 'bg-red-100 text-red-700' },
  { id: 'space', label: { en: 'Space & Science', vi: 'Vũ trụ & Khoa học' }, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'art', label: { en: 'Drawing & Creativity', vi: 'Vẽ & Sáng tạo' }, color: 'bg-pink-100 text-pink-700' },
  { id: 'sports', label: { en: 'Sports & Movement', vi: 'Thể thao & Vận động' }, color: 'bg-green-100 text-green-700' },
  { id: 'music', label: { en: 'Music & Dance', vi: 'Âm nhạc & Nhảy' }, color: 'bg-blue-100 text-blue-700' },
  { id: 'coding', label: { en: 'Coding & Games', vi: 'Lập trình & Game' }, color: 'bg-slate-100 text-slate-700' },
  { id: 'cooking', label: { en: 'Cooking & Baking', vi: 'Nấu ăn & Làm bánh' }, color: 'bg-orange-100 text-orange-700' },
  { id: 'reading', label: { en: 'Reading & Stories', vi: 'Đọc sách & Truyện' }, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'fashion', label: { en: 'Fashion & Beauty', vi: 'Thời trang & Làm đẹp' }, color: 'bg-purple-100 text-purple-700' },
];

const RATING_LABELS: LocalizedRatingLabel[] = [
  { value: 1, label: { en: 'Almost never', vi: 'Hầu như không' }, emoji: '⚪', color: 'text-gray-500' },
  { value: 2, label: { en: 'Rarely', vi: 'Hiếm khi' }, emoji: '🟠', color: 'text-orange-500' },
  { value: 3, label: { en: 'Sometimes', vi: 'Thỉnh thoảng' }, emoji: '🟡', color: 'text-yellow-600' },
  { value: 4, label: { en: 'Often', vi: 'Thường xuyên' }, emoji: '🟢', color: 'text-green-600' },
  { value: 5, label: { en: 'Always', vi: 'Luôn luôn' }, emoji: '🌟', color: 'text-blue-600' },
];

export const getAssessmentQuestionsPrimary = (language?: AppLanguage): AssessmentQuestion[] =>
  mapQuestions(PRIMARY_QUESTIONS, language);

export const getAssessmentQuestionsSecondary = (language?: AppLanguage): AssessmentQuestion[] =>
  mapQuestions(SECONDARY_QUESTIONS, language);

export const getFavoriteTopicOptions = (language?: AppLanguage) =>
  FAVORITE_TOPICS.map((topic) => ({
    id: topic.id,
    label: localizeText(topic.label, language),
    color: topic.color,
  }));

export const getRatingLabels = (language?: AppLanguage) =>
  RATING_LABELS.map((item) => ({
    value: item.value,
    label: localizeText(item.label, language),
    emoji: item.emoji,
    color: item.color,
  }));
