"""
Script seed đầy đủ cho cơ sở dữ liệu demo Kiddy-Mate
Tạo dữ liệu demo thực tế cho toàn bộ tính năng và luồng sử dụng.
""" 

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from beanie import Link
from app.core.time import utc_now
from app.models.beanie_models import (
    User, Child, Task, Reward, ChildReward, MiniGame, 
    GameSession, InteractionLog, Report, ChildTask, ChildDevelopmentAssessment
)
from app.models.reward_models import RedemptionRequest
from app.models.user_models import UserRole
from app.models.task_models import TaskCategory, TaskType, UnityType as TaskUnityType
from app.models.childtask_models import ChildTaskStatus, ChildTaskPriority, UnityType as ChildTaskUnityType
from app.models.reward_models import RewardType
from app.config import settings
from app.services.auth import hash_password

async def init_db():
    """Khởi tạo kết nối database và các model Beanie"""
    
    from app.models.child_models import Child
    from app.models.user_models import User
    from app.models.reward_models import Reward
    
    
    User.model_rebuild()
    # Rebuild Reward after User is defined to resolve forward reference
    Reward.model_rebuild()
    
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User, Child, Task, Reward, ChildReward, RedemptionRequest, MiniGame, 
            GameSession, InteractionLog, Report, ChildTask, ChildDevelopmentAssessment
        ]
    )

async def seed_database():
    """Seed toàn bộ database demo với dữ liệu thực tế"""
    print("\n" + "="*60)
    print("🌱 GIEO DỮ LIỆU CƠ SỞ DỮ LIỆU KIDDY-MATE")
    print("="*60 + "\n")
    
    await init_db()

    
    print("🗑️  Đang xóa dữ liệu hiện có...")
    await User.delete_all()
    await Child.delete_all()
    await Task.delete_all()
    await Reward.delete_all()
    await ChildReward.delete_all()
    await MiniGame.delete_all()
    await GameSession.delete_all()
    await InteractionLog.delete_all()
    await Report.delete_all()
    await ChildTask.delete_all()
    await ChildDevelopmentAssessment.delete_all()
    await RedemptionRequest.delete_all()
    print("   ✓ Đã xóa toàn bộ collection\n")

    
    
    
    print("👥 Đang tạo tài khoản phụ huynh...")
    demo_user = User(
        email="demo@kiddymate.com",
        password_hash=hash_password("demo123"),
        full_name="Sarah Johnson",
        phone_number="+1 555 0123",
        onboarding_completed=True,
        notification_settings={
            "email": {
                "enabled": True,
                "coin_redemption": True,
                "task_reminders": True,
                "emotional_trends": True,
                "weekly_reports": True
            },
            "push": {
                "enabled": False,
                "coin_redemption": True,
                "task_reminders": True,
                "emotional_trends": False,
                "weekly_reports": False
            }
        }
    )
    
    parent1 = User(
        email="parent1@example.com",
        password_hash=hash_password("password123"),
        full_name="Michael Chen",
        phone_number="+1 555 0124",
        role=UserRole.PARENT,
        onboarding_completed=True
    )
    
    parent2 = User(
        email="parent2@example.com",
        password_hash=hash_password("password123"),
        full_name="Emma Williams",
        role=UserRole.PARENT,
        onboarding_completed=False
    )
    
    await demo_user.create()
    await parent1.create()
    await parent2.create()
    print(f"   ✓ Đã tạo 3 tài khoản phụ huynh (demo, parent1, parent2)\n")

    
    
    
    print("👶 Đang tạo hồ sơ trẻ...")
    
    
    emma = Child(
        name="Emma Johnson",
        parent=Link(demo_user, User),
        birth_date=datetime(2015, 3, 15),
        nickname="Emmy",
        gender="nữ",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        personality=["sáng tạo", "đồng cảm", "tò mò"],
        interests=["vẽ", "âm nhạc", "kể chuyện", "động vật"],
        strengths=["sáng tạo", "nhận thức cảm xúc", "giao tiếp"],
        challenges=["toán", "duy trì tập trung", "quản lý thời gian"],
        initial_traits={"intelligence": 6, "creativity": 8, "social": 7},
        current_coins=125,
        level=3
    )
    
    lucas = Child(
        name="Lucas Johnson",
        parent=Link(demo_user, User),
        birth_date=datetime(2017, 7, 22),
        nickname="Luke",
        gender="nam",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        personality=["phân tích", "kiên trì", "hướng nội"],
        interests=["robot", "câu đố", "khoa học", "lego"],
        strengths=["tư duy logic", "giải quyết vấn đề", "tập trung"],
        challenges=["kỹ năng xã hội", "bộc lộ cảm xúc", "hoạt động thể chất"],
        initial_traits={"intelligence": 8, "creativity": 6, "social": 5},
        current_coins=75,
        level=2
    )
    
    sophia = Child(
        name="Sophia Johnson",
        parent=Link(demo_user, User),
        birth_date=datetime(2019, 11, 5),
        nickname="Sophie",
        gender="nữ",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
        personality=["năng động", "tự tin", "hòa đồng"],
        interests=["nhảy múa", "thể thao", "bạn bè", "trò chơi"],
        strengths=["kỹ năng vận động", "tự tin", "làm việc nhóm"],
        challenges=["kiên nhẫn", "thời gian yên tĩnh", "đọc sách"],
        initial_traits={"intelligence": 5, "creativity": 7, "social": 9},
        current_coins=50,
        level=1
    )
    
    
    alex = Child(
        name="Alex Chen",
        parent=Link(parent1, User),
        birth_date=datetime(2016, 5, 10),
        nickname="Alex",
        gender="nam",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        personality=["cân bằng", "thân thiện", "trách nhiệm"],
        interests=["trò chơi điện tử", "đọc sách", "lập trình"],
        strengths=["tư duy logic", "trách nhiệm", "ham học"],
        challenges=["hoạt động thể chất", "dự án mỹ thuật"],
        initial_traits={"intelligence": 7, "creativity": 6, "social": 7},
        current_coins=90,
        level=2
    )
    
    await emma.create()
    await lucas.create()
    await sophia.create()
    await alex.create()
    print(f"   ✓ Đã tạo 4 hồ sơ trẻ (Emma, Lucas, Sophia, Alex)\n")

    
    
    
    print("👤 Đang tạo tài khoản trẻ...")
    
    emma_account = User(
        email="emma@kiddymate.com",
        password_hash=hash_password("emma123"),
        full_name="Emma Johnson",
        role=UserRole.CHILD,
        child_profile=Link(emma, Child)
    )
    
    lucas_account = User(
        email="lucas@kiddymate.com",
        password_hash=hash_password("lucas123"),
        full_name="Lucas Johnson",
        role=UserRole.CHILD,
        child_profile=Link(lucas, Child)
    )
    
    await emma_account.create()
    await lucas_account.create()
    print(f"   ✓ Đã tạo 2 tài khoản trẻ (Emma, Lucas)\n")

    
    
    
    print("📊 Đang tạo đánh giá phát triển trẻ...")
    
    assessments = [
        ChildDevelopmentAssessment(
            child=Link(emma, Child),
            parent=Link(demo_user, User),
            discipline_autonomy={
                "completes_personal_tasks": "often",
                "keeps_personal_space_tidy": "sometimes",
                "finishes_simple_chores": "often",
                "follows_screen_time_rules": "sometimes",
                "struggles_with_activity_transitions": "rarely"
            },
            emotional_intelligence={
                "expresses_big_emotions_with_aggression": "rarely",
                "verbalizes_emotions": "often",
                "shows_empathy": "often",
                "displays_excessive_worry": "sometimes",
                "owns_mistakes": "often"
            },
            social_interaction={
                "joins_peer_groups_confidently": "often",
                "shares_and_waits_turns": "often",
                "resolves_conflict_with_words": "often",
                "prefers_solo_play": "rarely",
                "asks_for_help_politely": "often"
            }
        ),
        ChildDevelopmentAssessment(
            child=Link(lucas, Child),
            parent=Link(demo_user, User),
            discipline_autonomy={
                "completes_personal_tasks": "often",
                "keeps_personal_space_tidy": "often",
                "finishes_simple_chores": "often",
                "follows_screen_time_rules": "often",
                "struggles_with_activity_transitions": "sometimes"
            },
            emotional_intelligence={
                "expresses_big_emotions_with_aggression": "sometimes",
                "verbalizes_emotions": "sometimes",
                "shows_empathy": "sometimes",
                "displays_excessive_worry": "rarely",
                "owns_mistakes": "often"
            },
            social_interaction={
                "joins_peer_groups_confidently": "sometimes",
                "shares_and_waits_turns": "sometimes",
                "resolves_conflict_with_words": "sometimes",
                "prefers_solo_play": "often",
                "asks_for_help_politely": "often"
            }
        ),
    ]
    
    await ChildDevelopmentAssessment.insert_many(assessments)
    print(f"   ✓ Đã tạo {len(assessments)} bản đánh giá\n")

    
    
    
    print("📚 Đang tạo thư viện nhiệm vụ kèm unity type...")
    
    tasks_data = [
        
        {
            "title": "Dọn giường",
            "description": "Dọn giường gọn gàng mỗi buổi sáng",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-8",
            "reward_coins": 10,
            "reward_badge_name": "Sao Buổi Sáng",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Chuẩn bị cặp đi học",
            "description": "Soạn cặp đi học từ tối hôm trước",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "6-10",
            "reward_coins": 15,
            "reward_badge_name": "Siêu Ngăn Nắp",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Bày bàn ăn tối",
            "description": "Phụ giúp bày bàn cho bữa tối gia đình",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-9",
            "reward_coins": 12,
            "reward_badge_name": "Ngôi Sao Phụ Giúp"
        },
        {
            "title": "Sắp xếp đồ chơi",
            "description": "Cất toàn bộ đồ chơi về đúng chỗ",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-10",
            "reward_coins": 15,
            "reward_badge_name": "Vô Địch Gọn Gàng"
        },
        
        
        {
            "title": "Câu đố quy luật",
            "description": "Tìm số còn thiếu: 2, 4, 6, ?",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "6-8",
            "reward_coins": 20,
            "reward_badge_name": "Bậc Thầy Quy Luật",
            "unity_type": TaskUnityType.CHOICE
        },
        {
            "title": "Thử thách toán học",
            "description": "Giải: (5 + 3) × 2 = ?",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "8-10",
            "reward_coins": 25,
            "reward_badge_name": "Phù Thủy Toán",
            "unity_type": TaskUnityType.CHOICE
        },
        {
            "title": "Câu đố logic",
            "description": "Nếu mọi bông hồng đều là hoa và một số loài hoa tàn nhanh, vậy mọi bông hồng có tàn nhanh không?",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 3,
            "suggested_age_range": "9-12",
            "reward_coins": 30,
            "reward_badge_name": "Bậc Thầy Logic"
        },
        {
            "title": "Sudoku nhí",
            "description": "Hoàn thành ô số 4x4",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "7-10",
            "reward_coins": 25,
            "reward_badge_name": "Ngôi Sao Sudoku"
        },
        
        
        {
            "title": "20 lần bật nhảy",
            "description": "Thực hiện 20 lần bật nhảy đúng tư thế",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-10",
            "reward_coins": 15,
            "reward_badge_name": "Tràn Đầy Năng Lượng"
        },
        {
            "title": "Chơi ngoài trời",
            "description": "Vui chơi ngoài trời trong 30 phút",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-12",
            "reward_coins": 20,
            "reward_badge_name": "Nhà Thám Hiểm Thiên Nhiên"
        },
        {
            "title": "Học một động tác nhảy",
            "description": "Học và luyện tập một động tác nhảy mới",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "6-12",
            "reward_coins": 25,
            "reward_badge_name": "Vũ Công Nhí"
        },
        {
            "title": "Thử thách thăng bằng",
            "description": "Đứng một chân trong 30 giây",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-9",
            "reward_coins": 18,
            "reward_badge_name": "Bậc Thầy Thăng Bằng"
        },
        
        
        {
            "title": "Vẽ ước mơ của em",
            "description": "Vẽ bức tranh về ước mơ lớn nhất của em",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.EMOTION,
            "difficulty": 1,
            "suggested_age_range": "5-10",
            "reward_coins": 20,
            "reward_badge_name": "Họa Sĩ Ước Mơ",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Viết truyện ngắn",
            "description": "Viết một câu chuyện sáng tạo (ít nhất 5 câu)",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "7-12",
            "reward_coins": 30,
            "reward_badge_name": "Người Kể Chuyện",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Sáng tạo với khối xếp hình",
            "description": "Lắp ghép một mô hình sáng tạo bằng block/lego",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-10",
            "reward_coins": 25,
            "reward_badge_name": "Bậc Thầy Lắp Ghép"
        },
        {
            "title": "Phát minh trò chơi",
            "description": "Tự tạo một trò chơi với luật chơi riêng",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.LOGIC,
            "difficulty": 3,
            "suggested_age_range": "8-12",
            "reward_coins": 35,
            "reward_badge_name": "Nhà Sáng Tạo Trò Chơi"
        },
        
        
        {
            "title": "Nói lời cảm ơn",
            "description": "Cảm ơn một người đã giúp em hôm nay",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 1,
            "suggested_age_range": "5-10",
            "reward_coins": 10,
            "reward_badge_name": "Trái Tim Biết Ơn",
            "unity_type": TaskUnityType.TALK
        },
        {
            "title": "Giúp đỡ bạn bè",
            "description": "Giúp một người bạn làm điều bạn ấy thấy khó",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "6-12",
            "reward_coins": 25,
            "reward_badge_name": "Bàn Tay Giúp Đỡ",
            "unity_type": TaskUnityType.TALK
        },
        {
            "title": "Chia sẻ đồ chơi",
            "description": "Chia sẻ món đồ chơi yêu thích với anh chị em hoặc bạn bè",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "5-9",
            "reward_coins": 20,
            "reward_badge_name": "Ngôi Sao Chia Sẻ"
        },
        {
            "title": "Làm quen bạn mới",
            "description": "Bắt chuyện với một bạn mới ở trường hoặc sân chơi",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 3,
            "suggested_age_range": "6-12",
            "reward_coins": 30,
            "reward_badge_name": "Kết Nối Bạn Bè"
        },
        
        
        {
            "title": "Đọc sách 20 phút",
            "description": "Đọc sách trong 20 phút",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "6-12",
            "reward_coins": 20,
            "reward_badge_name": "Mọt Sách Nhí"
        },
        {
            "title": "Luyện từ chính tả",
            "description": "Luyện các từ chính tả trong tuần",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "6-10",
            "reward_coins": 22,
            "reward_badge_name": "Ong Vàng Chính Tả"
        },
        {
            "title": "Bài tập toán",
            "description": "Hoàn thành bài tập toán hôm nay",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "7-12",
            "reward_coins": 25,
            "reward_badge_name": "Chiến Binh Toán"
        },
        {
            "title": "Thí nghiệm khoa học",
            "description": "Thử một thí nghiệm khoa học đơn giản tại nhà",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 3,
            "suggested_age_range": "8-12",
            "reward_coins": 35,
            "reward_badge_name": "Nhà Khoa Học Nhí"
        },
        
        
        {
            "title": "Gọi tên cảm xúc",
            "description": "Nhận diện và gọi tên 3 cảm xúc em đã trải qua hôm nay",
            "category": TaskCategory.EQ,
            "type": TaskType.EMOTION,
            "difficulty": 1,
            "suggested_age_range": "5-9",
            "reward_coins": 15,
            "reward_badge_name": "Thám Tử Cảm Xúc"
        },
        {
            "title": "Thử thách tử tế",
            "description": "Làm 3 việc tử tế cho người khác hôm nay",
            "category": TaskCategory.EQ,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "6-12",
            "reward_coins": 25,
            "reward_badge_name": "Nhà Vô Địch Tử Tế"
        },
        {
            "title": "Thực hành bình tĩnh",
            "description": "Luyện hít thở sâu khi cảm thấy khó chịu",
            "category": TaskCategory.EQ,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "6-10",
            "reward_coins": 20,
            "reward_badge_name": "Bậc Thầy Bình Tĩnh"
        },
        
        
        {
            "title": "Trò chơi trí nhớ",
            "description": "Chơi trò ghép cặp trí nhớ và chiến thắng",
            "category": TaskCategory.IQ,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-9",
            "reward_coins": 18,
            "reward_badge_name": "Nhà Vô Địch Trí Nhớ"
        },
    ]
    
    tasks = [Task(**task_data) for task_data in tasks_data]
    await Task.insert_many(tasks)
    print(f"   ✓ Đã tạo {len(tasks)} nhiệm vụ cho mọi danh mục\n")

    
    
    
    print("🏪 Đang tạo cửa hàng phần thưởng...")
    
    # URL ảnh mặc định cho từng loại phần thưởng
    BADGE_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/d/df/Badge_1012.jpg"
    SKIN_IMAGE_URL = "https://images2.thanhnien.vn/zoom/686_429/Uploaded/nthanhluan/2021_11_08/picture3-1618.png"
    ITEM_IMAGE_URL = "https://res.cloudinary.com/hksqkdlah/image/upload/c_fill,dpr_2.0,f_auto,fl_lossy.progressive.strip_profile,g_faces:auto,q_auto:low/SFS_Crunchy_Battered-Fried_Chicken_63_wcz66g"
    
    rewards_data = [
        
        {"name": "Sao Buổi Sáng", "description": "Dành cho việc dọn giường mỗi ngày", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Siêu Ngăn Nắp", "description": "Bậc thầy sắp xếp gọn gàng", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Ngôi Sao Phụ Giúp", "description": "Luôn sẵn sàng giúp đỡ mọi người", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Bậc Thầy Quy Luật", "description": "Chuyên gia nhận diện quy luật", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Phù Thủy Toán", "description": "Thiên tài toán học!", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Tràn Đầy Năng Lượng", "description": "Luôn đầy năng lượng!", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Họa Sĩ Ước Mơ", "description": "Người mơ mộng đầy sáng tạo", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Trái Tim Biết Ơn", "description": "Luôn biết nói lời cảm ơn", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Mọt Sách Nhí", "description": "Yêu thích đọc sách", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        
        
        {"name": "Skin Siêu Anh Hùng", "description": "Hóa thân thành siêu anh hùng!", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 100, "stock_quantity": 0, "is_active": True},
        {"name": "Skin Công Chúa", "description": "Trở thành nàng công chúa xinh đẹp", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 100, "stock_quantity": 0, "is_active": True},
        {"name": "Skin Phi Hành Gia", "description": "Khám phá không gian!", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 120, "stock_quantity": 0, "is_active": True},
        {"name": "Skin Cướp Biển", "description": "Ra khơi bảy đại dương", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 100, "stock_quantity": 0, "is_active": True},
        {"name": "Skin Ninja", "description": "Linh hoạt và bí ẩn", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 150, "stock_quantity": 0, "is_active": True},
        {"name": "Skin Kỳ Lân", "description": "Biến hóa kỳ lân phép thuật", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 200, "stock_quantity": 0, "is_active": True},
        
        
        {"name": "Món ăn vặt yêu thích", "description": "Thưởng thức món ăn vặt em thích", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 30, "stock_quantity": 10, "is_active": True},
        {"name": "Thêm 30 phút màn hình", "description": "Thêm 30 phút thời gian sử dụng màn hình", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 50, "stock_quantity": 5, "is_active": True},
        {"name": "Chọn phim tối nay", "description": "Được chọn phim cho cả nhà", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 80, "stock_quantity": 3, "is_active": True},
        {"name": "Đi ăn kem", "description": "Đi ăn kem cùng gia đình", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 100, "stock_quantity": 2, "is_active": True},
        {"name": "Đồ chơi mới", "description": "Chọn một món đồ chơi nhỏ", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 200, "stock_quantity": 2, "is_active": True},
        {"name": "Buổi đi chơi đặc biệt", "description": "Một ngày đi chơi đặc biệt cùng ba mẹ", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 300, "stock_quantity": 1, "is_active": True},
    ]
    
    # Tạo phần thưởng và gán cho demo_user
    rewards = []
    for reward_data in rewards_data:
        reward = Reward(**reward_data, created_by=Link(demo_user, User))
        rewards.append(reward)
    await Reward.insert_many(rewards)
    print(f"   ✓ Đã tạo {len(rewards)} phần thưởng (huy hiệu, skin, vật phẩm) cho tài khoản demo\n")

    
    
    
    print("📋 Đang gán nhiệm vụ cho các bé...")
    
    now = utc_now()
    child_tasks = []
    
    
    emma_tasks = [
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[0], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=7), completed_at=now - timedelta(days=6), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[12], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=6), completed_at=now - timedelta(days=5), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[16], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(days=5), completed_at=now - timedelta(days=4), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[20], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=4), completed_at=now - timedelta(days=3), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[24], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        
        
        # Nhiệm vụ chờ phụ huynh xác minh
        ChildTask(child=Link(emma, Child), task=Link(tasks[1], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=1), progress=100, notes="Đã hoàn thành thói quen buổi sáng"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[13], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=1), progress=100, notes="Viết truyện về khu vườn kỳ diệu"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[17], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=12), progress=100, notes="Đã giúp bạn làm bài tập"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[20], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=8), progress=100, notes="Đã đọc sách 20 phút"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[25], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=4), progress=100, notes="Đã làm 3 việc tử tế hôm nay"),
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[5], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=5), due_date=now + timedelta(days=1), progress=60, notes="Đang làm câu 3/5", unity_type=ChildTaskUnityType.CHOICE),
        ChildTask(child=Link(emma, Child), task=Link(tasks[21], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=3), due_date=now + timedelta(days=1), progress=40, notes="Đã đọc 8/20 phút", unity_type=ChildTaskUnityType.CHOICE),
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.GIVEUP, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=3), progress=30, notes="Quá khó", unity_type=ChildTaskUnityType.TALK),
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[5], Task), status=ChildTaskStatus.UNASSIGNED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=2), unity_type=ChildTaskUnityType.TALK),
        ChildTask(child=Link(emma, Child), task=Link(tasks[6], Task), status=ChildTaskStatus.UNASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=1), unity_type=ChildTaskUnityType.LIFE),
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[9], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=2), unity_type=ChildTaskUnityType.LIFE),
        ChildTask(child=Link(emma, Child), task=Link(tasks[17], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=3), unity_type=ChildTaskUnityType.LIFE),
    ]
    child_tasks.extend(emma_tasks)
    
    
    lucas_tasks = [
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=5), completed_at=now - timedelta(days=4), progress=100),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[7], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=4), completed_at=now - timedelta(days=3), progress=100),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[27], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        
        
        # Nhiệm vụ chờ phụ huynh xác minh
        ChildTask(child=Link(lucas, Child), task=Link(tasks[14], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=1), progress=100, notes="Xây lâu đài robot"),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=10), progress=100, notes="Giải xong câu đố quy luật"),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[7], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=6), progress=100, notes="Hoàn thành Sudoku"),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[27], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=2), progress=100, notes="Thắng trò chơi trí nhớ"),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[22], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=4), due_date=now + timedelta(days=1), progress=70, notes="Sắp hoàn thành bài tập", unity_type=ChildTaskUnityType.CHOICE),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[6], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=2), due_date=now + timedelta(days=2), progress=30, unity_type=ChildTaskUnityType.CHOICE),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.GIVEUP, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=2), progress=20, notes="Không hứng thú", unity_type=ChildTaskUnityType.TALK),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[8], Task), status=ChildTaskStatus.UNASSIGNED, priority=ChildTaskPriority.MEDIUM, assigned_at=now, unity_type=ChildTaskUnityType.CHOICE),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[2], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now, due_date=now + timedelta(days=2), unity_type=ChildTaskUnityType.LIFE),
    ]
    child_tasks.extend(lucas_tasks)
    
    
    sophia_tasks = [
        
        ChildTask(child=Link(sophia, Child), task=Link(tasks[0], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        ChildTask(child=Link(sophia, Child), task=Link(tasks[8], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=2), completed_at=now - timedelta(days=1), progress=100),
        
        # Nhiệm vụ chờ phụ huynh xác minh
        ChildTask(child=Link(sophia, Child), task=Link(tasks[16], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=6), progress=100, notes="Đã nói cảm ơn cô giáo"),
        ChildTask(child=Link(sophia, Child), task=Link(tasks[10], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=3), progress=100, notes="Đã tập 20 lần bật nhảy"),
        
        ChildTask(child=Link(sophia, Child), task=Link(tasks[24], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=3)),
    ]
    child_tasks.extend(sophia_tasks)
    
    
    alex_tasks = [
        ChildTask(child=Link(alex, Child), task=Link(tasks[21], Task), status=ChildTaskStatus.COMPLETED, assigned_at=now - timedelta(days=4), completed_at=now - timedelta(days=3), progress=100),
        ChildTask(child=Link(alex, Child), task=Link(tasks[22], Task), status=ChildTaskStatus.COMPLETED, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        
        # Nhiệm vụ chờ phụ huynh xác minh
        ChildTask(child=Link(alex, Child), task=Link(tasks[5], Task), status=ChildTaskStatus.NEED_VERIFY, assigned_at=now - timedelta(hours=8), progress=100, notes="Hoàn thành thử thách toán"),
        ChildTask(child=Link(alex, Child), task=Link(tasks[14], Task), status=ChildTaskStatus.NEED_VERIFY, assigned_at=now - timedelta(hours=2), progress=100, notes="Lắp ghép mô hình sáng tạo"),
        
        ChildTask(child=Link(alex, Child), task=Link(tasks[25], Task), status=ChildTaskStatus.IN_PROGRESS, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=1), progress=60),
    ]
    child_tasks.extend(alex_tasks)
    
    await ChildTask.insert_many(child_tasks)
    print(f"   ✓ Đã tạo {len(child_tasks)} nhiệm vụ đã giao cho tất cả các bé\n")

    
    
    
    print("🏆 Đang cấp phần thưởng đã đạt cho các bé...")
    
    
    badge_rewards = [r for r in rewards if r.type == RewardType.BADGE]
    skin_rewards = [r for r in rewards if r.type == RewardType.SKIN]
    
    child_rewards_list = [
        
        ChildReward(child=Link(emma, Child), reward=Link(badge_rewards[0], Reward), earned_at=now - timedelta(days=6)),
        ChildReward(child=Link(emma, Child), reward=Link(badge_rewards[2], Reward), earned_at=now - timedelta(days=5)),
        ChildReward(child=Link(emma, Child), reward=Link(badge_rewards[6], Reward), earned_at=now - timedelta(days=4)),
        ChildReward(child=Link(emma, Child), reward=Link(badge_rewards[8], Reward), earned_at=now - timedelta(days=3)),
        ChildReward(child=Link(emma, Child), reward=Link(badge_rewards[7], Reward), earned_at=now - timedelta(days=2)),
        ChildReward(child=Link(emma, Child), reward=Link(skin_rewards[1], Reward), earned_at=now - timedelta(days=5), is_equipped=True),
        
        
        ChildReward(child=Link(lucas, Child), reward=Link(badge_rewards[3], Reward), earned_at=now - timedelta(days=4)),
        ChildReward(child=Link(lucas, Child), reward=Link(badge_rewards[4], Reward), earned_at=now - timedelta(days=3)),
        ChildReward(child=Link(lucas, Child), reward=Link(badge_rewards[8], Reward), earned_at=now - timedelta(days=2)),
        ChildReward(child=Link(lucas, Child), reward=Link(skin_rewards[2], Reward), earned_at=now - timedelta(days=3), is_equipped=True),
        
        
        ChildReward(child=Link(sophia, Child), reward=Link(badge_rewards[0], Reward), earned_at=now - timedelta(days=2)),
        ChildReward(child=Link(sophia, Child), reward=Link(badge_rewards[5], Reward), earned_at=now - timedelta(days=1)),
        
        
        ChildReward(child=Link(alex, Child), reward=Link(badge_rewards[8], Reward), earned_at=now - timedelta(days=3)),
        ChildReward(child=Link(alex, Child), reward=Link(badge_rewards[4], Reward), earned_at=now - timedelta(days=2)),
    ]
    
    await ChildReward.insert_many(child_rewards_list)
    print(f"   ✓ Đã tạo {len(child_rewards_list)} phần thưởng đã sở hữu\n")

    
    
    
    print("🛒 Đang tạo yêu cầu đổi thưởng...")
    
    # Lấy danh sách vật phẩm có thể đổi bằng xu
    item_rewards = [r for r in rewards if r.type == RewardType.ITEM]
    
    redemption_requests = [
        # Yêu cầu chờ xử lý - cần phụ huynh duyệt
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[0], Reward),  # Món ăn vặt yêu thích
            cost_coins=30,
            status="pending",
            requested_at=now - timedelta(hours=5)
        ),
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[1], Reward),  # Thêm 30 phút màn hình
            cost_coins=50,
            status="pending",
            requested_at=now - timedelta(hours=3)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[0], Reward),  # Món ăn vặt yêu thích
            cost_coins=30,
            status="pending",
            requested_at=now - timedelta(hours=8)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[2], Reward),  # Chọn phim tối nay
            cost_coins=80,
            status="pending",
            requested_at=now - timedelta(hours=2)
        ),
        RedemptionRequest(
            child=Link(sophia, Child),
            reward=Link(item_rewards[0], Reward),  # Món ăn vặt yêu thích
            cost_coins=30,
            status="pending",
            requested_at=now - timedelta(hours=1)
        ),
        RedemptionRequest(
            child=Link(alex, Child),
            reward=Link(item_rewards[1], Reward),  # Thêm 30 phút màn hình
            cost_coins=50,
            status="pending",
            requested_at=now - timedelta(hours=4)
        ),
        
        # Yêu cầu đã duyệt - đã xử lý
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[0], Reward),  # Món ăn vặt yêu thích
            cost_coins=30,
            status="approved",
            requested_at=now - timedelta(days=2, hours=3),
            processed_at=now - timedelta(days=2, hours=2),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[1], Reward),  # Thêm 30 phút màn hình
            cost_coins=50,
            status="approved",
            requested_at=now - timedelta(days=1, hours=5),
            processed_at=now - timedelta(days=1, hours=4),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(sophia, Child),
            reward=Link(item_rewards[0], Reward),  # Món ăn vặt yêu thích
            cost_coins=30,
            status="approved",
            requested_at=now - timedelta(days=1, hours=2),
            processed_at=now - timedelta(days=1, hours=1),
            processed_by=str(demo_user.id)
        ),
        
        # Yêu cầu bị từ chối - phụ huynh không chấp nhận
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[4], Reward),  # Đồ chơi mới (quá đắt)
            cost_coins=200,
            status="rejected",
            requested_at=now - timedelta(days=1, hours=8),
            processed_at=now - timedelta(days=1, hours=7),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[5], Reward),  # Buổi đi chơi đặc biệt (quá đắt)
            cost_coins=300,
            status="rejected",
            requested_at=now - timedelta(days=2, hours=4),
            processed_at=now - timedelta(days=2, hours=3),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(alex, Child),
            reward=Link(item_rewards[3], Reward),  # Đi ăn kem
            cost_coins=100,
            status="rejected",
            requested_at=now - timedelta(days=1, hours=10),
            processed_at=now - timedelta(days=1, hours=9),
            processed_by=str(parent1.id)
        ),
    ]
    
    await RedemptionRequest.insert_many(redemption_requests)
    pending_count = sum(1 for r in redemption_requests if r.status == 'pending')
    approved_count = sum(1 for r in redemption_requests if r.status == 'approved')
    rejected_count = sum(1 for r in redemption_requests if r.status == 'rejected')
    print(f"   ✓ Đã tạo {len(redemption_requests)} yêu cầu đổi thưởng (chờ duyệt: {pending_count}, duyệt: {approved_count}, từ chối: {rejected_count})\n")

    
    
    
    print("🎮 Đang tạo mini game...")
    
    games = [
        MiniGame(name="Bậc Thầy Logic", description="Giải câu đố để tăng khả năng tư duy logic", linked_skill="Logic"),
        MiniGame(name="Khung Vẽ Sáng Tạo", description="Thể hiện bản thân qua hội họa và kể chuyện", linked_skill="Creativity"),
        MiniGame(name="Kết Nối Xã Hội", description="Luyện kỹ năng giao tiếp và thấu cảm", linked_skill="Social"),
        MiniGame(name="Phiêu Lưu Toán Học", description="Vượt qua thử thách và câu đố toán học thú vị", linked_skill="Academic"),
        MiniGame(name="Khám Phá Cảm Xúc", description="Học cách nhận diện và quản lý cảm xúc", linked_skill="EQ"),
        MiniGame(name="Thử Thách Trí Nhớ", description="Rèn luyện trí nhớ qua các trò chơi vui nhộn", linked_skill="Logic"),
    ]
    
    await MiniGame.insert_many(games)
    print(f"   ✓ Đã tạo {len(games)} mini game\n")

    
    
    
    print("🕹️  Đang tạo lịch sử phiên chơi...")
    
    game_sessions = [
        
        GameSession(
            child=Link(emma, Child), game=Link(games[0], MiniGame), 
            start_time=now - timedelta(days=3, hours=2), 
            end_time=now - timedelta(days=3, hours=1, minutes=45),
            score=85,
            behavior_data={"time_spent": 900, "attempts": 2, "accuracy": 0.85, "focus_level": "high"}
        ),
        GameSession(
            child=Link(emma, Child), game=Link(games[1], MiniGame), 
            start_time=now - timedelta(days=2, hours=3), 
            end_time=now - timedelta(days=2, hours=2, minutes=30),
            score=92,
            behavior_data={"time_spent": 1800, "attempts": 1, "accuracy": 0.92, "focus_level": "very_high"}
        ),
        GameSession(
            child=Link(emma, Child), game=Link(games[4], MiniGame), 
            start_time=now - timedelta(days=1, hours=5), 
            end_time=now - timedelta(days=1, hours=4, minutes=40),
            score=88,
            behavior_data={"time_spent": 1200, "attempts": 1, "accuracy": 0.88, "focus_level": "high"}
        ),
        
        
        GameSession(
            child=Link(lucas, Child), game=Link(games[0], MiniGame), 
            start_time=now - timedelta(days=4), 
            end_time=now - timedelta(days=4, minutes=-25),
            score=95,
            behavior_data={"time_spent": 1500, "attempts": 1, "accuracy": 0.95, "focus_level": "very_high"}
        ),
        GameSession(
            child=Link(lucas, Child), game=Link(games[3], MiniGame), 
            start_time=now - timedelta(days=2, hours=4), 
            end_time=now - timedelta(days=2, hours=3, minutes=35),
            score=90,
            behavior_data={"time_spent": 1500, "attempts": 2, "accuracy": 0.90, "focus_level": "high"}
        ),
        GameSession(
            child=Link(lucas, Child), game=Link(games[5], MiniGame), 
            start_time=now - timedelta(hours=6), 
            end_time=None,
            score=None,
            behavior_data=None
        ),
        
        
        GameSession(
            child=Link(sophia, Child), game=Link(games[2], MiniGame), 
            start_time=now - timedelta(days=2), 
            end_time=now - timedelta(days=2, minutes=-15),
            score=75,
            behavior_data={"time_spent": 900, "attempts": 3, "accuracy": 0.75, "focus_level": "medium"}
        ),
        GameSession(
            child=Link(sophia, Child), game=Link(games[1], MiniGame), 
            start_time=now - timedelta(hours=10), 
            end_time=now - timedelta(hours=9, minutes=50),
            score=80,
            behavior_data={"time_spent": 600, "attempts": 2, "accuracy": 0.80, "focus_level": "medium"}
        ),
    ]
    
    await GameSession.insert_many(game_sessions)
    print(f"   ✓ Đã tạo {len(game_sessions)} phiên chơi\n")

    
    
    
    print("💬 Đang tạo lịch sử hội thoại...")
    
    interactions = [
        # Emma
        InteractionLog(
            child=Link(emma, Child),
            user_input="Chào bạn, hôm nay bạn thế nào?",
            avatar_response="Chào Emma! Mình rất vui. Hôm nay bạn đã hoàn thành nhiệm vụ đọc sách, tuyệt vời lắm! 📚",
            detected_emotion="Happy",
            timestamp=now - timedelta(days=2, hours=5)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Hôm nay mình thấy rất sáng tạo!",
            avatar_response="Tuyệt quá! Sáng tạo là siêu năng lực của bạn. Bạn muốn thử nhiệm vụ viết truyện không? ✨",
            detected_emotion="Excited",
            timestamp=now - timedelta(days=2, hours=4)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Bạn giúp mình bài toán này nhé?",
            avatar_response="Được chứ! Mình cùng chia nhỏ từng bước để giải nhé. Bạn đang vướng chỗ nào?",
            detected_emotion="Curious",
            timestamp=now - timedelta(days=1, hours=6)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Mình vừa hoàn thành truyện ngắn rồi!",
            avatar_response="Quá giỏi luôn! Mình rất tự hào vì bạn đã hoàn thành nhiệm vụ viết truyện. 🌟",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=1, hours=3)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Mình hơi lo về bài kiểm tra ngày mai",
            avatar_response="Lo lắng trước bài kiểm tra là bình thường. Bạn đã cố gắng rất nhiều, mình tin bạn làm được!",
            detected_emotion="Worried",
            timestamp=now - timedelta(hours=2, minutes=15)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Cảm ơn vì đã luôn đồng hành cùng mình",
            avatar_response="Mình luôn ở đây để hỗ trợ bạn. Bạn đang làm rất tốt mỗi ngày! 💕",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=45)
        ),

        # Lucas
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Hôm nay mình lắp được robot mới!",
            avatar_response="Đỉnh quá Lucas! Bạn thật khéo léo và sáng tạo. Robot của bạn có thể làm gì vậy? 🤖",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=3, hours=4)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Mình bực vì câu đố này khó quá",
            avatar_response="Mình hiểu cảm giác đó. Nghỉ một chút rồi thử lại theo cách khác nhé, bạn sẽ làm được.",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(hours=1, minutes=15)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Vì sao bầu trời có màu xanh?",
            avatar_response="Câu hỏi hay quá! Bầu trời xanh vì ánh sáng Mặt Trời bị tán xạ trong khí quyển. Muốn nghe thêm không?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=1, minutes=10)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Mình muốn kết bạn nhưng hơi ngại",
            avatar_response="Không sao cả, kết bạn cần thời gian. Mình có thể gợi ý vài câu mở đầu dễ nói nhé?",
            detected_emotion="Worried",
            timestamp=now - timedelta(days=1, hours=4)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Mình vừa làm xong bài toán!",
            avatar_response="Giỏi lắm! Bạn đã kiên trì và hoàn thành rất tốt. Hãy tự thưởng cho mình một tràng vỗ tay nào! 👏",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=2)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Mình muốn trở thành nhà khoa học",
            avatar_response="Mục tiêu tuyệt vời! Hãy giữ sự tò mò và tiếp tục thử nghiệm mỗi ngày nhé. 🔬",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=2, minutes=25)
        ),

        # Sophia
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Mình muốn chơi trò mới!",
            avatar_response="Yay! Chúng ta cùng chơi nhé. Bạn muốn thử trò trí nhớ hay trò kết nối xã hội nào? 🎮",
            detected_emotion="Excited",
            timestamp=now - timedelta(days=2, hours=3)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Mình tự dọn giường rồi đó!",
            avatar_response="Tuyệt vời Sophia! Bạn ngày càng tự lập và có trách nhiệm. Mình rất tự hào về bạn! ⭐",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=1, hours=10)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Mình hơi sợ chó to",
            avatar_response="Cảm thấy sợ là điều bình thường. Mình sẽ chỉ bạn cách giữ bình tĩnh và an toàn khi gặp chó nhé.",
            detected_emotion="Scared",
            timestamp=now - timedelta(hours=2, minutes=40)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Hôm nay mình vui lắm!",
            avatar_response="Mình cũng vui lây đây! Điều gì làm hôm nay của bạn đặc biệt thế? 😊",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=36, minutes=15)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Mình buồn vì bạn chuyển trường",
            avatar_response="Mình hiểu cảm giác đó. Bạn có thể giữ liên lạc và vẫn là bạn tốt của nhau mà.",
            detected_emotion="Sad",
            timestamp=now - timedelta(hours=7, minutes=25)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Mình chia sẻ đồ ăn cho bạn",
            avatar_response="Bạn thật tử tế! Chia sẻ là một thói quen rất đẹp. Bạn thấy thế nào khi làm vậy? 💕",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=55)
        ),

        # Alex
        InteractionLog(
            child=Link(alex, Child),
            user_input="Hôm nay mình nên làm nhiệm vụ nào?",
            avatar_response="Để mình xem nhé, Alex! Bạn có thể bắt đầu với đọc sách hoặc bài tập toán. Bạn chọn cái nào trước?",
            detected_emotion="Neutral",
            timestamp=now - timedelta(days=1, hours=9)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Mình vừa học thêm lập trình",
            avatar_response="Tuyệt quá! Lập trình giúp bạn rèn tư duy rất tốt. Hôm nay bạn viết được gì rồi? 💻",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=22, minutes=30)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Mình khó chịu vì code bị lỗi",
            avatar_response="Mình hiểu mà, debug đôi khi rất mệt. Ta cùng kiểm tra từng phần nhỏ để tìm lỗi nhé.",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(hours=4, minutes=10)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Tại sao chúng ta cần học lịch sử?",
            avatar_response="Lịch sử giúp mình hiểu quá khứ và rút kinh nghiệm cho tương lai. Nó giống một cuốn truyện lớn của nhân loại.",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=6, minutes=35)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Mình lo là sẽ làm bài kiểm tra không tốt",
            avatar_response="Lo lắng là bình thường. Bạn đã học chăm chỉ rồi, cứ bình tĩnh và làm hết sức nhé.",
            detected_emotion="Worried",
            timestamp=now - timedelta(hours=12, minutes=20)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Cảm ơn vì đã dạy mình",
            avatar_response="Mình rất vui khi được đồng hành cùng bạn. Bạn đang tiến bộ từng ngày đó! 🌟",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=15)
        ),
    ]

    await InteractionLog.insert_many(interactions)
    print(f"   ✓ Đã tạo {len(interactions)} bản ghi hội thoại kèm nhận diện cảm xúc\n")

    
    
    
    print("📊 Đang tạo báo cáo tiến độ...")
    
    reports_list = [
        
        Report(
            child=Link(emma, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Emma đã có tiến bộ rất tốt trong giai đoạn này! Bé hoàn thành 11 nhiệm vụ ở nhiều nhóm khác nhau, thể hiện năng lực nổi bật về sáng tạo và trí tuệ cảm xúc. Tỷ lệ hoàn thành 85% là rất ấn tượng. Emma đặc biệt nổi trội ở các nhiệm vụ sáng tạo và cải thiện rõ rệt ở các bài logic. Trạng thái cảm xúc nhìn chung tích cực, có lúc tò mò và đôi khi hơi nản khi gặp thử thách, điều này hoàn toàn bình thường và thể hiện tư duy phát triển.",
            insights={
                "tasks_completed": 11,
                "tasks_verified": 9,
                "coins_earned": 245,
                "completion_rate": 85,
                "most_active_category": "Sáng tạo",
                "strengths": ["sáng tạo", "nhận thức cảm xúc", "giao tiếp", "ổn định"],
                "areas_for_improvement": ["kỹ năng toán", "quản lý thời gian"],
                "emotion_trends": {"Happy": 35, "Excited": 25, "Curious": 20, "Proud": 15, "Frustrated": 5},
                "most_common_emotion": "Happy",
                "emotional_analysis": "Emma thể hiện trạng thái cảm xúc chủ đạo là tích cực trong suốt giai đoạn. Tỷ lệ hoàn thành cao và mức độ tham gia tốt ở các nhiệm vụ sáng tạo cho thấy bé tự tin và có động lực. Tỷ trọng cảm xúc 'Happy' và 'Excited' (60%) cho thấy bé đang tận hưởng quá trình học. Những lúc 'Frustrated' (5%) khi làm toán là điều tự nhiên, và sự kiên trì của bé phản ánh khả năng phục hồi cảm xúc tốt. Các cảm xúc 'Curious' và 'Proud' cũng cho thấy nhận thức bản thân tích cực."
            },
            suggestions={
                "focus": "Tiếp tục nuôi dưỡng sự sáng tạo đồng thời tăng sự tự tin với môn toán",
                "recommended_tasks": ["Thử thách toán học", "Câu đố logic", "Câu đố quy luật"],
                "games": "Thử mini game Bậc Thầy Logic để cải thiện kỹ năng giải quyết vấn đề",
                "parenting_tips": "Khen ngợi nỗ lực ở các môn khó và ghi nhận thành tích sáng tạo. Khi bé nản với môn toán, hãy công nhận cảm xúc và chia nhỏ nhiệm vụ thành các bước dễ làm."
            }
        ),
        
        
        Report(
            child=Link(lucas, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Lucas tiếp tục nổi bật ở các nhiệm vụ logic và giải quyết vấn đề. Bé hoàn thành 8 nhiệm vụ với tỷ lệ hoàn thành 75%. Khả năng tập trung và tư duy phân tích là điểm mạnh rõ rệt. Tuy nhiên, bé sẽ hưởng lợi nếu có thêm nhiệm vụ tương tác xã hội để tăng tự tin. Mẫu cảm xúc cho thấy bé tự hào về thành tích, đặc biệt ở bài logic, nhưng cũng có lo lắng khi tương tác xã hội; đây là vùng cần hỗ trợ nhẹ nhàng và nhất quán.",
            insights={
                "tasks_completed": 8,
                "tasks_verified": 7,
                "coins_earned": 170,
                "completion_rate": 75,
                "most_active_category": "Logic",
                "strengths": ["tư duy logic", "giải quyết vấn đề", "tập trung", "phân tích"],
                "areas_for_improvement": ["kỹ năng xã hội", "hoạt động thể chất", "bộc lộ cảm xúc"],
                "emotion_trends": {"Proud": 30, "Curious": 25, "Happy": 20, "Neutral": 15, "Frustrated": 5, "Worried": 5},
                "most_common_emotion": "Proud",
                "emotional_analysis": "Lucas có hồ sơ cảm xúc cân bằng, nổi bật cảm xúc tích cực khi đạt thành tích. Cảm xúc 'Proud' (30%) cao nhất, phản ánh sự hài lòng ở các nhiệm vụ logic và giải quyết vấn đề. 'Curious' (25%) cho thấy sự ham học hỏi tự nhiên. Sự xuất hiện của 'Worried' (5%) gợi ý một chút lo lắng trong tình huống xã hội, khá phổ biến ở trẻ thiên về phân tích. Tổng thể cảm xúc ổn định và tích cực, đồng thời còn dư địa để tăng tự tin xã hội qua hoạt động phù hợp."
            },
            suggestions={
                "focus": "Khuyến khích nhiệm vụ xã hội và hoạt động bộc lộ cảm xúc",
                "recommended_tasks": ["Giúp đỡ bạn bè", "Chia sẻ đồ chơi", "Gọi tên cảm xúc"],
                "games": "Chơi mini game Kết Nối Xã Hội để luyện tình huống giao tiếp",
                "parenting_tips": "Tạo cơ hội tương tác bạn bè và xác nhận cảm xúc của bé. Ghi nhận thành tích logic, đồng thời khuyến khích dần các hoạt động xã hội. Giúp bé hiểu rằng lo lắng đôi lúc là bình thường."
            }
        ),
        
        
        Report(
            child=Link(sophia, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Sophia có khởi đầu rất tốt! Bé thể hiện sự hào hứng và năng lượng tích cực ở mọi nhiệm vụ. Hoàn thành 5 nhiệm vụ với tỷ lệ xác minh 100%. Kỹ năng xã hội và sự tự tin của bé thể hiện rõ. Vì bé mới bắt đầu, trọng tâm hiện tại là xây dựng thói quen và ghi nhận từng thành tích nhỏ. Trạng thái cảm xúc rất tích cực, mức 'Excited' và 'Happy' cao, phù hợp với tính cách năng động và tự tin của bé.",
            insights={
                "tasks_completed": 5,
                "tasks_verified": 5,
                "coins_earned": 80,
                "completion_rate": 100,
                "most_active_category": "Tự lập",
                "strengths": ["tự tin", "kỹ năng xã hội", "năng lượng", "nhiệt tình"],
                "areas_for_improvement": ["kiên nhẫn", "hoạt động yên tĩnh", "tập trung"],
                "emotion_trends": {"Excited": 50, "Happy": 30, "Proud": 20},
                "most_common_emotion": "Excited",
                "emotional_analysis": "Sophia thể hiện hồ sơ cảm xúc đặc biệt tích cực và tràn đầy năng lượng. Cảm xúc chiếm ưu thế là 'Excited' (50%), phù hợp với tính cách năng động và hứng thú với hoạt động mới. Kết hợp với 'Happy' (30%) và 'Proud' (20%), bé có 100% cảm xúc tích cực, cho thấy mức tự tin và động lực học tập cao. Trạng thái này gợi ý bé đang cảm thấy thành công và thích thú với quá trình học. Với tỷ lệ hoàn thành cao, bé đã sẵn sàng cho nhiệm vụ thử thách hơn một chút nhưng vẫn giữ nhịp tích cực."
            },
            suggestions={
                "focus": "Xây nền nếp sinh hoạt và giới thiệu dần các hoạt động yên tĩnh",
                "recommended_tasks": ["Đọc sách 20 phút", "Thực hành bình tĩnh", "Sáng tạo với khối xếp hình"],
                "games": "Chơi mini game Thử Thách Trí Nhớ để tăng tập trung và kiên nhẫn",
                "parenting_tips": "Ăn mừng các thành công ban đầu và duy trì thói quen ổn định. Chuyển năng lượng hào hứng của bé vào hoạt động có cấu trúc. Tăng dần thời gian yên tĩnh để rèn tập trung."
            }
        ),
    ]
    
    await Report.insert_many(reports_list)
    print(f"   ✓ Đã tạo {len(reports_list)} báo cáo tiến độ\n")

    
    
    
    print("="*60)
    print("✅ SEED DỮ LIỆU THÀNH CÔNG!")
    print("="*60)
    print(f"""
📈 Thống Kê Cơ Sở Dữ Liệu:
   • Tài khoản phụ huynh: 3 (demo@kiddymate.com, parent1/2@example.com)
   • Tài khoản trẻ: 2 (emma@kiddymate.com, lucas@kiddymate.com)
   • Hồ sơ trẻ: 4 (Emma, Lucas, Sophia, Alex)
   • Nhiệm vụ trong thư viện: {len(tasks)} (có unity type)
   • Nhiệm vụ đã gán: {len(child_tasks)} (đủ các trạng thái)
   • Phần thưởng: {len(rewards)} (huy hiệu, skin, vật phẩm)
   • Phần thưởng đã sở hữu: {len(child_rewards_list)}
   • Mini game: {len(games)}
   • Phiên chơi: {len(game_sessions)}
   • Hội thoại: {len(interactions)}
   • Báo cáo: {len(reports_list)}
   • Đánh giá: {len(assessments) if 'assessments' in locals() else 0}
   • Yêu cầu đổi thưởng: {len(redemption_requests) if 'redemption_requests' in locals() else 0}

🔑 Tài Khoản Đăng Nhập:
   Tài khoản phụ huynh:
   - Email: demo@kiddymate.com / Mật khẩu: demo123
   - Email: parent1@example.com / Mật khẩu: password123
   - Email: parent2@example.com / Mật khẩu: password123
   
   Tài khoản trẻ:
   - Email: emma@kiddymate.com / Mật khẩu: emma123
   - Email: lucas@kiddymate.com / Mật khẩu: lucas123

📝 Tính Năng Mới Đã Bao Phủ:
   ✓ Vai trò người dùng (phụ huynh/trẻ)
   ✓ Tài khoản trẻ liên kết với hồ sơ
   ✓ Unity type cho nhiệm vụ (life, choice, talk)
   ✓ Trạng thái nhiệm vụ: unassigned, giveup
   ✓ Đánh giá phục vụ ngữ cảnh LLM

📝 Tính Năng Đã Bao Phủ:
   ✓ Dashboard với số liệu và biểu đồ thực
   ✓ Trung tâm nhiệm vụ (thư viện, đã gán, đủ trạng thái)
   ✓ Trung tâm phần thưởng (cửa hàng, đổi thưởng)
   ✓ Cài đặt (hồ sơ, thông báo)
   ✓ Lịch sử phiên chơi game
   ✓ Nhật ký hội thoại
   ✓ Báo cáo tiến độ theo tuần
   
🎯 Sẵn sàng kiểm thử toàn bộ luồng!
    """)


if __name__ == "__main__":
    asyncio.run(seed_database())
