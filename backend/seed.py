import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.beanie_models import (
    User, Child, Task, Reward, ChildReward, MiniGame, 
    GameSession, InteractionLog, Report, ChildTask
)
from app.models.task_models import TaskCategory, TaskType
from app.models.childtask_models import ChildTaskStatus
from app.models.reward_models import RewardType
from app.config import settings
from app.services.auth import hash_password

async def init_db():
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User, Child, Task, Reward, ChildReward, MiniGame, 
            GameSession, InteractionLog, Report, ChildTask
        ]
    )

async def seed_database():
    print(">>> Bắt đầu seed database...")
    await init_db()

    print(">>> Đang xóa dữ liệu cũ...")
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
    print(">>> Đã xóa dữ liệu cũ!")

    # Tạo người dùng mẫu với password hash đúng cách
    print(">>> Đang tạo users...")
    user1 = User(
        email="parent1@example.com",
        password_hash=hash_password("password123"),
        full_name="Nguyễn Văn A"
    )
    user2 = User(
        email="parent2@example.com",
        password_hash=hash_password("password123"),
        full_name="Trần Thị B"
    )
    user3 = User(
        email="admin@kiddymate.com",
        password_hash=hash_password("admin123"),
        full_name="Admin User"
    )
    await user1.create()
    await user2.create()
    await user3.create()
    print(f">>> Đã tạo {3} users")

    # Tạo trẻ em mẫu
    print(">>> Đang tạo children...")
    child1 = Child(
        name="Nguyễn Minh An",
        parent=user1,  # type: ignore
        birth_date=datetime(2015, 5, 15),
        nickname="An",
        gender="female",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=An",
        personality=["outgoing", "creative", "empathetic"],
        interests=["drawing", "music", "storytelling"],
        strengths=["creativity", "communication", "emotional awareness"],
        challenges=["math", "staying focused", "following routines"],
        initial_traits={"intelligence": 5, "creativity": 7, "social": 6},
        current_coins=50,
        level=2
    )
    child2 = Child(
        name="Trần Đức Bình",
        parent=user1,  # type: ignore
        birth_date=datetime(2017, 8, 20),
        nickname="Bình",
        gender="male",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Binh",
        personality=["analytical", "curious", "introverted"],
        interests=["robots", "puzzles", "science experiments"],
        strengths=["logic", "problem-solving", "attention to detail"],
        challenges=["social interaction", "expressing emotions", "physical activities"],
        initial_traits={"intelligence": 6, "creativity": 8, "social": 7},
        current_coins=30,
        level=1
    )
    child3 = Child(
        name="Lê Phương Chi",
        parent=user1,  # type: ignore
        birth_date=datetime(2016, 3, 10),
        nickname="Chi",
        gender="female",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Chi",
        personality=["energetic", "confident", "leader"],
        interests=["sports", "dance", "team games"],
        strengths=["physical coordination", "social skills", "confidence"],
        challenges=["patience", "quiet activities", "detailed work"],
        initial_traits={"intelligence": 7, "creativity": 6, "social": 8},
        current_coins=100,
        level=3
    )
    await child1.create()
    await child2.create()
    await child3.create()
    print(f">>> Đã tạo {3} children")

    # Tạo nhiệm vụ mẫu
    print(">>> Đang tạo tasks...")
    tasks = [
        Task(
            title="Giải bài toán đơn giản",
            description="Tính toán: 2 + 3 = ?",
            category=TaskCategory.IQ,
            type=TaskType.LOGIC,
            difficulty=1,
            suggested_age_range="6-8",
            reward_coins=10,
            reward_badge_name="Badge Toán Học Cơ Bản"
        ),
        Task(
            title="Nhận biết cảm xúc",
            description="Quan sát hình ảnh và mô tả cảm xúc",
            category=TaskCategory.EQ,
            type=TaskType.EMOTION,
            difficulty=1,
            suggested_age_range="6-8",
            reward_coins=15,
            reward_badge_name="Badge Nhận Biết Cảm Xúc"
        ),
        Task(
            title="Giải câu đố logic",
            description="Tìm quy luật và điền số tiếp theo: 2, 4, 6, ?",
            category=TaskCategory.IQ,
            type=TaskType.LOGIC,
            difficulty=2,
            suggested_age_range="8-10",
            reward_coins=20,
            reward_badge_name="Badge Logic Nâng Cao"
        ),
        Task(
            title="Thể hiện sự đồng cảm",
            description="Kể về cách bạn an ủi một người bạn buồn",
            category=TaskCategory.EQ,
            type=TaskType.EMOTION,
            difficulty=2,
            suggested_age_range="8-10",
            reward_coins=25,
            reward_badge_name="Badge Đồng Cảm"
        ),
        Task(
            title="Bài toán phức tạp",
            description="Giải bài toán: (5 + 3) × 2 = ?",
            category=TaskCategory.IQ,
            type=TaskType.LOGIC,
            difficulty=3,
            suggested_age_range="10-12",
            reward_coins=30,
            reward_badge_name="Badge Toán Học Nâng Cao"
        ),
    ]
    await Task.insert_many(tasks)
    print(f">>> Đã tạo {len(tasks)} tasks")

    # Tạo phần thưởng mẫu
    print(">>> Đang tạo rewards...")
    rewards = [
        Reward(
            name="Badge Toán Học Cơ Bản",
            description="Hoàn thành bài toán đầu tiên",
            type=RewardType.BADGE,
            image_url="https://example.com/badges/math-basic.png"
        ),
        Reward(
            name="Badge Nhận Biết Cảm Xúc",
            description="Hiểu được cảm xúc của người khác",
            type=RewardType.BADGE,
            image_url="https://example.com/badges/emotion-recognition.png"
        ),
        Reward(
            name="Badge Logic Nâng Cao",
            description="Giải được câu đố logic khó",
            type=RewardType.BADGE,
            image_url="https://example.com/badges/logic-advanced.png"
        ),
        Reward(
            name="Badge Đồng Cảm",
            description="Thể hiện sự đồng cảm với người khác",
            type=RewardType.BADGE,
            image_url="https://example.com/badges/empathy.png"
        ),
        Reward(
            name="Badge Toán Học Nâng Cao",
            description="Giải được bài toán phức tạp",
            type=RewardType.BADGE,
            image_url="https://example.com/badges/math-advanced.png"
        ),
        Reward(
            name="Skin Siêu Anh Hùng",
            description="Skin avatar siêu anh hùng",
            type=RewardType.SKIN,
            image_url="https://example.com/skins/superhero.png"
        ),
        Reward(
            name="Skin Công Chúa",
            description="Skin avatar công chúa",
            type=RewardType.SKIN,
            image_url="https://example.com/skins/princess.png"
        ),
        Reward(
            name="Skin Khủng Long",
            description="Skin avatar khủng long",
            type=RewardType.SKIN,
            image_url="https://example.com/skins/dinosaur.png"
        ),
    ]
    await Reward.insert_many(rewards)
    print(f">>> Đã tạo {len(rewards)} rewards")

    # Tạo mini-game mẫu
    print(">>> Đang tạo mini games...")
    minigames = [
        MiniGame(
            name="Trò chơi Logic",
            description="Rèn luyện tư duy logic qua các câu đố",
            linked_skill="Logic"
        ),
        MiniGame(
            name="Trò chơi Sáng Tạo",
            description="Phát triển khả năng sáng tạo",
            linked_skill="Creativity"
        ),
        MiniGame(
            name="Trò chơi Giao Tiếp",
            description="Cải thiện kỹ năng giao tiếp xã hội",
            linked_skill="Social"
        ),
        MiniGame(
            name="Trò chơi Toán Học",
            description="Luyện tập toán học vui nhộn",
            linked_skill="Math"
        ),
    ]
    await MiniGame.insert_many(minigames)
    print(f">>> Đã tạo {len(minigames)} mini games")

    # Tạo ChildTask mẫu
    print(">>> Đang tạo child tasks...")
    # Fetch tasks để dùng
    all_tasks = await Task.find_all().to_list()
    
    # Child 1 có một số tasks ở nhiều trạng thái
    child_task1 = ChildTask(
        child=child1,
        task=all_tasks[0],  # Task đầu tiên
        status=ChildTaskStatus.COMPLETED,
        assigned_at=datetime.now() - timedelta(days=5),
        completed_at=datetime.now() - timedelta(days=4)
    )
    child_task2 = ChildTask(
        child=child1,
        task=all_tasks[1],  # Task thứ hai
        status=ChildTaskStatus.NEED_VERIFY,
        assigned_at=datetime.now() - timedelta(days=3)
    )
    child_task3 = ChildTask(
        child=child1,  # type: ignore
        task=all_tasks[2],  # type: ignore
        status=ChildTaskStatus.IN_PROGRESS,
        assigned_at=datetime.now() - timedelta(days=1)
    )
    
    # Child 2 có một task đã hoàn thành
    child_task4 = ChildTask(
        child=child2,
        task=all_tasks[0],
        status=ChildTaskStatus.COMPLETED,
        assigned_at=datetime.now() - timedelta(days=7),
        completed_at=datetime.now() - timedelta(days=6)
    )
    
    # Child 3 có một số tasks
    child_task5 = ChildTask(
        child=child3,
        task=all_tasks[3],
        status=ChildTaskStatus.COMPLETED,
        assigned_at=datetime.now() - timedelta(days=10),
        completed_at=datetime.now() - timedelta(days=9)
    )
    child_task6 = ChildTask(
        child=child3,  # type: ignore
        task=all_tasks[4],  # type: ignore
        status=ChildTaskStatus.IN_PROGRESS,
        assigned_at=datetime.now() - timedelta(days=2)
    )

    # Child 2 có thêm một nhiệm vụ chưa bắt đầu
    unassigned_task_ref = all_tasks[5] if len(all_tasks) > 5 else all_tasks[0]
    child_task7 = ChildTask(
        child=child2,
        task=unassigned_task_ref,
        status=ChildTaskStatus.UNASSIGNED,
        assigned_at=datetime.now() - timedelta(days=1)
    )
    
    await ChildTask.insert_many([
        child_task1, child_task2, child_task3,
        child_task4, child_task5, child_task6,
        child_task7
    ])
    print(f">>> Đã tạo {7} child tasks")

    # Tạo ChildReward mẫu (rewards đã nhận)
    print(">>> Đang tạo child rewards...")
    # Fetch rewards để dùng
    all_rewards = await Reward.find_all().to_list()
    
    # Child 1 đã nhận một số badges
    child_reward1 = ChildReward(
        child=child1,  # type: ignore
        reward=all_rewards[0],  # type: ignore
        earned_at=datetime.now() - timedelta(days=4)
    )
    child_reward2 = ChildReward(
        child=child1,  # type: ignore
        reward=all_rewards[5],  # type: ignore
        earned_at=datetime.now() - timedelta(days=3)
    )
    
    # Child 2 đã nhận một badge
    child_reward3 = ChildReward(
        child=child2,  # type: ignore
        reward=all_rewards[0],  # type: ignore
        earned_at=datetime.now() - timedelta(days=6)
    )
    
    # Child 3 đã nhận nhiều rewards
    child_reward4 = ChildReward(
        child=child3,  # type: ignore
        reward=all_rewards[3],  # type: ignore
        earned_at=datetime.now() - timedelta(days=9)
    )
    child_reward5 = ChildReward(
        child=child3,  # type: ignore
        reward=all_rewards[6],  # type: ignore
        earned_at=datetime.now() - timedelta(days=8)
    )
    child_reward6 = ChildReward(
        child=child3,  # type: ignore
        reward=all_rewards[7],  # type: ignore
        earned_at=datetime.now() - timedelta(days=7)
    )
    
    await ChildReward.insert_many([
        child_reward1, child_reward2, child_reward3,
        child_reward4, child_reward5, child_reward6
    ])
    print(f">>> Đã tạo {6} child rewards")

    # Tạo GameSession mẫu
    print(">>> Đang tạo game sessions...")
    # Fetch games để dùng
    all_games = await MiniGame.find_all().to_list()
    
    # Child 1 đã chơi một số games
    game_session1 = GameSession(
        child=child1,  # type: ignore
        game=all_games[0],  # type: ignore
        start_time=datetime.now() - timedelta(days=2, hours=3),
        end_time=datetime.now() - timedelta(days=2, hours=2, minutes=45),
        score=85,
        behavior_data={
            "time_spent": 900,  # 15 phút
            "attempts": 3,
            "accuracy": 0.85,
            "focus_level": "high"
        }
    )
    game_session2 = GameSession(
        child=child1,  # type: ignore
        game=all_games[1],  # type: ignore
        start_time=datetime.now() - timedelta(days=1, hours=2),
        end_time=datetime.now() - timedelta(days=1, hours=1, minutes=30),
        score=92,
        behavior_data={
            "time_spent": 1800,  # 30 phút
            "attempts": 2,
            "accuracy": 0.92,
            "focus_level": "very_high"
        }
    )
    
    # Child 2 đã chơi một game
    game_session3 = GameSession(
        child=child2,  # type: ignore
        game=all_games[0],  # type: ignore
        start_time=datetime.now() - timedelta(days=5),
        end_time=datetime.now() - timedelta(days=5, minutes=-20),
        score=78,
        behavior_data={
            "time_spent": 1200,  # 20 phút
            "attempts": 4,
            "accuracy": 0.78,
            "focus_level": "medium"
        }
    )
    
    # Child 3 đã chơi nhiều games
    game_session4 = GameSession(
        child=child3,  # type: ignore
        game=all_games[2],  # type: ignore
        start_time=datetime.now() - timedelta(days=8),
        end_time=datetime.now() - timedelta(days=8, minutes=-15),
        score=95,
        behavior_data={
            "time_spent": 1500,  # 25 phút
            "attempts": 1,
            "accuracy": 0.95,
            "focus_level": "very_high"
        }
    )
    game_session5 = GameSession(
        child=child3,  # type: ignore
        game=all_games[3],  # type: ignore
        start_time=datetime.now() - timedelta(hours=5),
        end_time=None,  # Đang chơi
        score=None,
        behavior_data=None
    )
    
    await GameSession.insert_many([
        game_session1, game_session2, game_session3,
        game_session4, game_session5
    ])
    print(f">>> Đã tạo {5} game sessions")

    # Tạo InteractionLog mẫu
    print(">>> Đang tạo interaction logs...")
    interaction_logs = [
        InteractionLog(
            child=child1,  # type: ignore
            user_input="Xin chào, bạn tên gì?",
            avatar_response="Xin chào! Mình là KiddyMate, bạn đồng hành của bạn!",
            detected_emotion="happy",
            timestamp=datetime.now() - timedelta(days=1, hours=5)
        ),
        InteractionLog(
            child=child1,  # type: ignore
            user_input="2 + 2 bằng mấy?",
            avatar_response="2 + 2 = 4! Bạn giỏi quá!",
            detected_emotion="curious",
            timestamp=datetime.now() - timedelta(days=1, hours=4)
        ),
        InteractionLog(
            child=child2,  # type: ignore
            user_input="Hôm nay mình buồn",
            avatar_response="Mình hiểu cảm giác của bạn. Hãy kể cho mình nghe chuyện gì đã xảy ra nhé!",
            detected_emotion="sad",
            timestamp=datetime.now() - timedelta(days=3)
        ),
        InteractionLog(
            child=child3,  # type: ignore
            user_input="Mình muốn chơi game",
            avatar_response="Tuyệt vời! Bạn muốn chơi game nào? Mình có nhiều game thú vị lắm!",
            detected_emotion="excited",
            timestamp=datetime.now() - timedelta(hours=2)
        ),
        InteractionLog(
            child=child3,  # type: ignore
            user_input="Cảm ơn bạn",
            avatar_response="Không có gì! Mình luôn sẵn sàng giúp đỡ bạn!",
            detected_emotion="happy",
            timestamp=datetime.now() - timedelta(hours=1)
        ),
    ]
    await InteractionLog.insert_many(interaction_logs)
    print(f">>> Đã tạo {len(interaction_logs)} interaction logs")

    # Tạo Report mẫu
    print(">>> Đang tạo reports...")
    reports = [
        Report(
            child=child1,  # type: ignore
            period_start=datetime(2025, 1, 1),
            period_end=datetime(2025, 1, 31),
            generated_at=datetime(2025, 2, 1),
            summary_text="Bé An đã có tiến bộ tốt trong tháng 1. Hoàn thành 2 tasks và nhận được 1 badge. Cần tiếp tục phát triển kỹ năng logic.",
            insights={
                "tasks_completed": 2,
                "tasks_verified": 1,
                "coins_earned": 25,
                "strengths": ["logic", "creativity"],
                "areas_for_improvement": ["emotional intelligence"]
            },
            suggestions={
                "focus": "Nên làm thêm các tasks về cảm xúc",
                "recommended_tasks": ["Nhận biết cảm xúc", "Thể hiện sự đồng cảm"],
                "games": "Chơi thêm Trò chơi Giao Tiếp"
            }
        ),
        Report(
            child=child2,  # type: ignore
            period_start=datetime(2025, 1, 1),
            period_end=datetime(2025, 1, 31),
            generated_at=datetime(2025, 2, 1),
            summary_text="Bé Bình đã bắt đầu tham gia các hoạt động. Hoàn thành 1 task và đang phát triển kỹ năng cơ bản.",
            insights={
                "tasks_completed": 1,
                "tasks_verified": 1,
                "coins_earned": 10,
                "strengths": ["basic logic"],
                "areas_for_improvement": ["advanced thinking", "creativity"]
            },
            suggestions={
                "focus": "Tiếp tục luyện tập các bài toán cơ bản",
                "recommended_tasks": ["Giải bài toán đơn giản", "Giải câu đố logic"],
                "games": "Chơi Trò chơi Logic để rèn luyện"
            }
        ),
        Report(
            child=child3,  # type: ignore
            period_start=datetime(2025, 1, 1),
            period_end=datetime(2025, 1, 31),
            generated_at=datetime(2025, 2, 1),
            summary_text="Bé Chi đã có thành tích xuất sắc trong tháng 1. Hoàn thành nhiều tasks, nhận được nhiều rewards và có kỹ năng giao tiếp tốt.",
            insights={
                "tasks_completed": 1,
                "tasks_verified": 1,
                "coins_earned": 25,
                "strengths": ["emotional intelligence", "social skills", "creativity"],
                "areas_for_improvement": ["advanced math"]
            },
            suggestions={
                "focus": "Tiếp tục phát triển kỹ năng toán học nâng cao",
                "recommended_tasks": ["Bài toán phức tạp", "Giải câu đố logic"],
                "games": "Chơi Trò chơi Toán Học để nâng cao kỹ năng"
            }
        ),
    ]
    await Report.insert_many(reports)
    print("Tạo xong reports")

    print("Hoàn tất seed dữ liệu")

# Chạy script
if __name__ == "__main__":
    asyncio.run(seed_database())
