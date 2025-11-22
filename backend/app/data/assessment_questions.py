"""
Assessment questions data - mirrors frontend assessmentQuestions.ts
Used for building prompts to OpenAI API
"""

ASSESSMENT_QUESTIONS = {
    # Primary (6-10 years old)
    "p_disc_1": {
        "question": "Bé có tự giác hoàn thành các việc cá nhân (đánh răng, thay đồ) mà không cần nhắc nhở nhiều lần không?",
        "category": "discipline",
        "description": "Đánh giá thói quen tự chăm sóc bản thân"
    },
    "p_disc_2": {
        "question": "Bé có giữ gìn góc học tập/phòng chơi của mình gọn gàng, tự cất đồ chơi/sách vở sau khi dùng xong không?",
        "category": "discipline",
        "description": "Đánh giá ý thức tự quản lý không gian cá nhân"
    },
    "p_disc_3": {
        "question": "Khi được giao một việc nhà đơn giản (ví dụ: lau bàn, cho thú cưng ăn), bé có hoàn thành đến cùng không?",
        "category": "discipline",
        "description": "Đánh giá trách nhiệm với nhiệm vụ được giao"
    },
    "p_disc_4": {
        "question": "Bé có tuân thủ các quy tắc về thời gian sử dụng thiết bị điện tử (TV/iPad) mà gia đình đặt ra không?",
        "category": "discipline",
        "description": "Đánh giá khả năng tuân thủ quy tắc công nghệ"
    },
    "p_disc_5": {
        "question": "Bé có gặp khó khăn khi phải chuyển từ một hoạt động yêu thích (như xem TV) sang một hoạt động khác (như đi tắm) không?",
        "category": "discipline",
        "description": "Đánh giá tính linh hoạt trong chuyển đổi hoạt động (câu hỏi ngược)"
    },
    "p_emo_1": {
        "question": "Khi bé cảm thấy thất vọng hoặc tức giận (ví dụ: thua một trò chơi), bé có biểu hiện la hét, ném đồ hoặc đánh người khác không?",
        "category": "emotional",
        "description": "Đánh giá kiểm soát cảm xúc tiêu cực (câu hỏi ngược)"
    },
    "p_emo_2": {
        "question": "Bé có thể diễn đạt cảm xúc của mình bằng lời (ví dụ: \"Con đang buồn\", \"Con đang tức\") thay vì chỉ khóc hoặc cáu kỉnh không?",
        "category": "emotional",
        "description": "Đánh giá khả năng nhận diện và diễn đạt cảm xúc"
    },
    "p_emo_3": {
        "question": "Bé có biểu hiện đồng cảm (ví dụ: cố gắng dỗ dành) khi thấy bạn bè hoặc người thân đang buồn hoặc bị đau không?",
        "category": "emotional",
        "description": "Đánh giá sự đồng cảm và quan tâm người khác"
    },
    "p_emo_4": {
        "question": "Bé có có vẻ lo lắng thái quá về những việc nhỏ nhặt hoặc về việc đi học không?",
        "category": "emotional",
        "description": "Đánh giá mức độ lo âu (câu hỏi ngược)"
    },
    "p_emo_5": {
        "question": "Khi bé làm sai điều gì, bé có dũng cảm nhận lỗi hay có xu hướng đổ lỗi cho người khác/hoàn cảnh?",
        "category": "emotional",
        "description": "Đánh giá trách nhiệm cá nhân và sự trung thực"
    },
    "p_social_1": {
        "question": "Bé có dễ dàng tham gia vào một nhóm bạn đang chơi và tự tin kết bạn mới không?",
        "category": "social",
        "description": "Đánh giá sự tự tin trong giao tiếp xã hội"
    },
    "p_social_2": {
        "question": "Trong khi chơi nhóm, bé có biết cách chia sẻ đồ chơi và chờ đến lượt mình không?",
        "category": "social",
        "description": "Đánh giá kỹ năng hợp tác và chia sẻ"
    },
    "p_social_3": {
        "question": "Khi xảy ra tranh cãi với bạn, bé có xu hướng giải quyết bằng lời nói hay dùng bạo lực (xô đẩy, đánh bạn)?",
        "category": "social",
        "description": "Đánh giá kỹ năng giải quyết xung đột"
    },
    "p_social_4": {
        "question": "Bé có vẻ thích chơi một mình hơn là chơi với các bạn khác không?",
        "category": "social",
        "description": "Đánh giá xu hướng xã hội vs độc lập (câu hỏi ngược)"
    },
    "p_social_5": {
        "question": "Bé có biết cách nhờ sự giúp đỡ (từ bạn bè hoặc người lớn) một cách lịch sự khi gặp khó khăn không?",
        "category": "social",
        "description": "Đánh giá kỹ năng tìm kiếm hỗ trợ"
    },
    # Secondary (11-14 years old)
    "s_auto_1": {
        "question": "Bé có tự giác lập kế hoạch và hoàn thành bài tập về nhà mà không cần phụ huynh giám sát/nhắc nhở liên tục không?",
        "category": "discipline",
        "description": "Đánh giá tính tự chủ trong học tập"
    },
    "s_auto_2": {
        "question": "Bé có khả năng tự quản lý thời gian của mình (cân bằng giữa học tập, giải trí, và các hoạt động ngoại khóa) không?",
        "category": "discipline",
        "description": "Đánh giá kỹ năng quản lý thời gian"
    },
    "s_auto_3": {
        "question": "Bé có hay trì hoãn các nhiệm vụ quan trọng (ví dụ: học bài thi) đến phút cuối cùng không?",
        "category": "discipline",
        "description": "Đánh giá xu hướng trì hoãn (câu hỏi ngược)"
    },
    "s_auto_4": {
        "question": "Bé có giữ lời hứa và hoàn thành các cam kết (với gia đình, bạn bè) một cách đáng tin cậy không?",
        "category": "discipline",
        "description": "Đánh giá sự trung thực và đáng tin cậy"
    },
    "s_social_1": {
        "question": "Bạn bè có vẻ như là ưu tiên hàng đầu và có ảnh hưởng lớn đến các quyết định/sở thích của bé không?",
        "category": "social",
        "description": "Đánh giá ảnh hưởng của đồng trang lứa"
    },
    "s_social_2": {
        "question": "Bé có kể cho bạn nghe về những áp lực đồng trang lứa (peer pressure) mà bé gặp phải không (ví dụ: bị rủ rê làm điều sai trái)?",
        "category": "social",
        "description": "Đánh giá mức độ cởi mở về áp lực bạn bè"
    },
    "s_social_3": {
        "question": "Bạn có nhận thấy bé có dấu hiệu bị bắt nạt (ví dụ: không muốn đi học, mất đồ, buồn bã không rõ lý do) hoặc đang bắt nạt người khác không?",
        "category": "social",
        "description": "Đánh giá dấu hiệu bắt nạt (câu hỏi ngược)"
    },
    "s_social_4": {
        "question": "Bé có thể duy trì các mối quan hệ bạn bè lành mạnh, hay thường xuyên xảy ra xung đột, \"drama\" với bạn bè?",
        "category": "social",
        "description": "Đánh giá chất lượng mối quan hệ bạn bè"
    },
    "s_social_5": {
        "question": "Bé có thể hiện sự đồng cảm và quan điểm rõ ràng khi thảo luận về các vấn đề xã hội không?",
        "category": "social",
        "description": "Đánh giá tư duy xã hội và sự trưởng thành"
    },
    "s_comm_1": {
        "question": "Khi bé gặp chuyện không vui hoặc căng thẳng, bé có chủ động chia sẻ với bạn hay có xu hướng giấu kín và tự giải quyết?",
        "category": "emotional",
        "description": "Đánh giá mức độ cởi mở với gia đình"
    },
    "s_comm_2": {
        "question": "Bạn có cảm thấy bé \"đóng cửa\" và ít giao tiếp với gia đình hơn trước, thay vào đó dành nhiều thời gian cho bạn bè hoặc ở một mình không?",
        "category": "emotional",
        "description": "Đánh giá xu hướng rời xa gia đình (câu hỏi ngược)"
    },
    "s_comm_3": {
        "question": "Bé có biểu hiện các dấu hiệu căng thẳng (stress) rõ rệt (ví dụ: rối loạn giấc ngủ, cáu gắt, thay đổi thói quen ăn uống) không?",
        "category": "emotional",
        "description": "Đánh giá dấu hiệu căng thẳng tâm lý (câu hỏi ngược)"
    },
    "s_comm_4": {
        "question": "Bé phản ứng thế nào với thất bại (ví dụ: điểm kém)? Bé có thể vực dậy hay chìm trong thất vọng, tự trách bản thân?",
        "category": "emotional",
        "description": "Đánh giá khả năng phục hồi (resilience)"
    },
    "s_comm_5": {
        "question": "Bé có hay so sánh bản thân với người khác (bạn bè, người nổi tiếng trên mạng) và cảm thấy tự ti không?",
        "category": "emotional",
        "description": "Đánh giá lòng tự trọng và hình ảnh bản thân (câu hỏi ngược)"
    },
}

