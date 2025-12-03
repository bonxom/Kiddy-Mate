"""
Comprehensive Seed Script for Kiddy-Mate Demo Database
Creates realistic demo data for all features and workflows.
""" 

import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from beanie import Link
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
    """Initialize database connection and Beanie models"""
    
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
    """Seed complete demo database with realistic data"""
    print("\n" + "="*60)
    print("🌱 KIDDY-MATE DATABASE SEEDING")
    print("="*60 + "\n")
    
    await init_db()

    
    print("🗑️  Clearing existing data...")
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
    print("   ✓ All collections cleared\n")

    
    
    
    print("👥 Creating parent users...")
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
    print(f"   ✓ Created 3 parent users (demo, parent1, parent2)\n")

    
    
    
    print("👶 Creating children profiles...")
    
    
    emma = Child(
        name="Emma Johnson",
        parent=Link(demo_user, User),
        birth_date=datetime(2015, 3, 15),
        nickname="Emmy",
        gender="female",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        personality=["creative", "empathetic", "curious"],
        interests=["drawing", "music", "stories", "animals"],
        strengths=["creativity", "emotional awareness", "communication"],
        challenges=["math", "staying focused", "time management"],
        initial_traits={"intelligence": 6, "creativity": 8, "social": 7},
        current_coins=125,
        level=3
    )
    
    lucas = Child(
        name="Lucas Johnson",
        parent=Link(demo_user, User),
        birth_date=datetime(2017, 7, 22),
        nickname="Luke",
        gender="male",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
        personality=["analytical", "determined", "introverted"],
        interests=["robots", "puzzles", "science", "lego"],
        strengths=["logic", "problem-solving", "focus"],
        challenges=["social skills", "expressing emotions", "physical activities"],
        initial_traits={"intelligence": 8, "creativity": 6, "social": 5},
        current_coins=75,
        level=2
    )
    
    sophia = Child(
        name="Sophia Johnson",
        parent=Link(demo_user, User),
        birth_date=datetime(2019, 11, 5),
        nickname="Sophie",
        gender="female",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
        personality=["energetic", "confident", "social"],
        interests=["dance", "sports", "friends", "games"],
        strengths=["physical skills", "confidence", "teamwork"],
        challenges=["patience", "quiet time", "reading"],
        initial_traits={"intelligence": 5, "creativity": 7, "social": 9},
        current_coins=50,
        level=1
    )
    
    
    alex = Child(
        name="Alex Chen",
        parent=Link(parent1, User),
        birth_date=datetime(2016, 5, 10),
        nickname="Alex",
        gender="male",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        personality=["balanced", "friendly", "responsible"],
        interests=["video games", "reading", "coding"],
        strengths=["logic", "responsibility", "learning"],
        challenges=["physical activities", "art projects"],
        initial_traits={"intelligence": 7, "creativity": 6, "social": 7},
        current_coins=90,
        level=2
    )
    
    await emma.create()
    await lucas.create()
    await sophia.create()
    await alex.create()
    print(f"   ✓ Created 4 children (Emma, Lucas, Sophia, Alex)\n")

    
    
    
    print("👤 Creating child user accounts...")
    
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
    print(f"   ✓ Created 2 child accounts (Emma, Lucas)\n")

    
    
    
    print("📊 Creating child development assessments...")
    
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
    print(f"   ✓ Created {len(assessments)} assessments\n")

    
    
    
    print("📚 Creating task library with unity types...")
    
    tasks_data = [
        
        {
            "title": "Make Your Bed",
            "description": "Make your bed neatly every morning",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-8",
            "reward_coins": 10,
            "reward_badge_name": "Morning Star",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Pack Your School Bag",
            "description": "Pack your school bag the night before",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "6-10",
            "reward_coins": 15,
            "reward_badge_name": "Super Organized",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Set the Dinner Table",
            "description": "Help set the table for family dinner",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-9",
            "reward_coins": 12,
            "reward_badge_name": "Helper Star"
        },
        {
            "title": "Organize Your Toys",
            "description": "Put all toys back in their proper places",
            "category": TaskCategory.INDEPENDENCE,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-10",
            "reward_coins": 15,
            "reward_badge_name": "Tidy Champion"
        },
        
        
        {
            "title": "Pattern Puzzle",
            "description": "Find the missing number: 2, 4, 6, ?",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "6-8",
            "reward_coins": 20,
            "reward_badge_name": "Pattern Master",
            "unity_type": TaskUnityType.CHOICE
        },
        {
            "title": "Math Challenge",
            "description": "Solve: (5 + 3) × 2 = ?",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "8-10",
            "reward_coins": 25,
            "reward_badge_name": "Math Wizard",
            "unity_type": TaskUnityType.CHOICE
        },
        {
            "title": "Logic Riddle",
            "description": "If all roses are flowers and some flowers fade quickly, can all roses fade quickly?",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 3,
            "suggested_age_range": "9-12",
            "reward_coins": 30,
            "reward_badge_name": "Logic Master"
        },
        {
            "title": "Sudoku Junior",
            "description": "Complete a 4x4 number puzzle",
            "category": TaskCategory.LOGIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "7-10",
            "reward_coins": 25,
            "reward_badge_name": "Sudoku Star"
        },
        
        
        {
            "title": "20 Jumping Jacks",
            "description": "Do 20 jumping jacks with good form",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-10",
            "reward_coins": 15,
            "reward_badge_name": "Energizer"
        },
        {
            "title": "Outdoor Play Time",
            "description": "Play outside for 30 minutes",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "5-12",
            "reward_coins": 20,
            "reward_badge_name": "Nature Explorer"
        },
        {
            "title": "Learn a Dance Move",
            "description": "Learn and practice a new dance move",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "6-12",
            "reward_coins": 25,
            "reward_badge_name": "Dancer"
        },
        {
            "title": "Balance Challenge",
            "description": "Stand on one foot for 30 seconds",
            "category": TaskCategory.PHYSICAL,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-9",
            "reward_coins": 18,
            "reward_badge_name": "Balance Master"
        },
        
        
        {
            "title": "Draw Your Dream",
            "description": "Draw a picture of your biggest dream",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.EMOTION,
            "difficulty": 1,
            "suggested_age_range": "5-10",
            "reward_coins": 20,
            "reward_badge_name": "Dream Artist",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Write a Short Story",
            "description": "Write a creative story (at least 5 sentences)",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "7-12",
            "reward_coins": 30,
            "reward_badge_name": "Storyteller",
            "unity_type": TaskUnityType.LIFE
        },
        {
            "title": "Build with Blocks",
            "description": "Build something creative with blocks/lego",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-10",
            "reward_coins": 25,
            "reward_badge_name": "Master Builder"
        },
        {
            "title": "Invent a Game",
            "description": "Create your own game with rules",
            "category": TaskCategory.CREATIVITY,
            "type": TaskType.LOGIC,
            "difficulty": 3,
            "suggested_age_range": "8-12",
            "reward_coins": 35,
            "reward_badge_name": "Game Inventor"
        },
        
        
        {
            "title": "Say Thank You",
            "description": "Thank someone who helped you today",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 1,
            "suggested_age_range": "5-10",
            "reward_coins": 10,
            "reward_badge_name": "Grateful Heart",
            "unity_type": TaskUnityType.TALK
        },
        {
            "title": "Help a Friend",
            "description": "Help a friend with something they find difficult",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "6-12",
            "reward_coins": 25,
            "reward_badge_name": "Helping Hand",
            "unity_type": TaskUnityType.TALK
        },
        {
            "title": "Share Your Toys",
            "description": "Share your favorite toy with a sibling/friend",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "5-9",
            "reward_coins": 20,
            "reward_badge_name": "Sharing Star"
        },
        {
            "title": "Make a New Friend",
            "description": "Talk to someone new at school/playground",
            "category": TaskCategory.SOCIAL,
            "type": TaskType.EMOTION,
            "difficulty": 3,
            "suggested_age_range": "6-12",
            "reward_coins": 30,
            "reward_badge_name": "Friendship Builder"
        },
        
        
        {
            "title": "Read for 20 Minutes",
            "description": "Read a book for 20 minutes",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 1,
            "suggested_age_range": "6-12",
            "reward_coins": 20,
            "reward_badge_name": "Bookworm"
        },
        {
            "title": "Practice Spelling Words",
            "description": "Practice your weekly spelling words",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "6-10",
            "reward_coins": 22,
            "reward_badge_name": "Spelling Bee"
        },
        {
            "title": "Math Homework",
            "description": "Complete today's math homework",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "7-12",
            "reward_coins": 25,
            "reward_badge_name": "Math Champion"
        },
        {
            "title": "Science Experiment",
            "description": "Try a simple science experiment at home",
            "category": TaskCategory.ACADEMIC,
            "type": TaskType.LOGIC,
            "difficulty": 3,
            "suggested_age_range": "8-12",
            "reward_coins": 35,
            "reward_badge_name": "Young Scientist"
        },
        
        
        {
            "title": "Name Your Feelings",
            "description": "Identify and name 3 emotions you felt today",
            "category": TaskCategory.EQ,
            "type": TaskType.EMOTION,
            "difficulty": 1,
            "suggested_age_range": "5-9",
            "reward_coins": 15,
            "reward_badge_name": "Emotion Detective"
        },
        {
            "title": "Kindness Challenge",
            "description": "Do 3 kind things for others today",
            "category": TaskCategory.EQ,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "6-12",
            "reward_coins": 25,
            "reward_badge_name": "Kindness Champion"
        },
        {
            "title": "Calm Down Practice",
            "description": "Practice deep breathing when you feel upset",
            "category": TaskCategory.EQ,
            "type": TaskType.EMOTION,
            "difficulty": 2,
            "suggested_age_range": "6-10",
            "reward_coins": 20,
            "reward_badge_name": "Calm Master"
        },
        
        
        {
            "title": "Memory Game",
            "description": "Play a memory matching game and win",
            "category": TaskCategory.IQ,
            "type": TaskType.LOGIC,
            "difficulty": 2,
            "suggested_age_range": "5-9",
            "reward_coins": 18,
            "reward_badge_name": "Memory Champion"
        },
    ]
    
    tasks = [Task(**task_data) for task_data in tasks_data]
    await Task.insert_many(tasks)
    print(f"   ✓ Created {len(tasks)} tasks across all categories\n")

    
    
    
    print("🏪 Creating reward shop...")
    
    # Default image URLs for each reward type
    BADGE_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/d/df/Badge_1012.jpg"
    SKIN_IMAGE_URL = "https://images2.thanhnien.vn/zoom/686_429/Uploaded/nthanhluan/2021_11_08/picture3-1618.png"
    ITEM_IMAGE_URL = "https://res.cloudinary.com/hksqkdlah/image/upload/c_fill,dpr_2.0,f_auto,fl_lossy.progressive.strip_profile,g_faces:auto,q_auto:low/SFS_Crunchy_Battered-Fried_Chicken_63_wcz66g"
    
    rewards_data = [
        
        {"name": "Morning Star", "description": "For making bed every day", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Super Organized", "description": "Master of organization", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Helper Star", "description": "Always helping others", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Pattern Master", "description": "Expert at finding patterns", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Math Wizard", "description": "Math genius!", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Energizer", "description": "Full of energy!", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Dream Artist", "description": "Creative dreamer", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Grateful Heart", "description": "Always thankful", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        {"name": "Bookworm", "description": "Loves reading", "type": RewardType.BADGE, "image_url": BADGE_IMAGE_URL, "cost_coins": 0},
        
        
        {"name": "Superhero Skin", "description": "Transform into a superhero!", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 100, "stock_quantity": 0, "is_active": True},
        {"name": "Princess Skin", "description": "Become a beautiful princess", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 100, "stock_quantity": 0, "is_active": True},
        {"name": "Astronaut Skin", "description": "Explore space!", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 120, "stock_quantity": 0, "is_active": True},
        {"name": "Pirate Skin", "description": "Sail the seven seas", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 100, "stock_quantity": 0, "is_active": True},
        {"name": "Ninja Skin", "description": "Stealth and speed", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 150, "stock_quantity": 0, "is_active": True},
        {"name": "Unicorn Skin", "description": "Magical unicorn transformation", "type": RewardType.SKIN, "image_url": SKIN_IMAGE_URL, "cost_coins": 200, "stock_quantity": 0, "is_active": True},
        
        
        {"name": "Favorite Snack", "description": "Your favorite snack as a treat", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 30, "stock_quantity": 10, "is_active": True},
        {"name": "30 Min Extra Screen Time", "description": "30 minutes extra screen time", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 50, "stock_quantity": 5, "is_active": True},
        {"name": "Movie Night Choice", "description": "Choose the family movie", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 80, "stock_quantity": 3, "is_active": True},
        {"name": "Ice Cream Trip", "description": "Trip to the ice cream shop", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 100, "stock_quantity": 2, "is_active": True},
        {"name": "New Toy", "description": "Small toy of your choice", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 200, "stock_quantity": 2, "is_active": True},
        {"name": "Special Outing", "description": "Special day out with parents", "type": RewardType.ITEM, "image_url": ITEM_IMAGE_URL, "cost_coins": 300, "stock_quantity": 1, "is_active": True},
    ]
    
    # Create rewards and assign them to demo_user
    rewards = []
    for reward_data in rewards_data:
        reward = Reward(**reward_data, created_by=Link(demo_user, User))
        rewards.append(reward)
    await Reward.insert_many(rewards)
    print(f"   ✓ Created {len(rewards)} rewards (badges, skins, items) for demo user\n")

    
    
    
    print("📋 Assigning tasks to children...")
    
    now = datetime.utcnow()
    child_tasks = []
    
    
    emma_tasks = [
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[0], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=7), completed_at=now - timedelta(days=6), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[12], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=6), completed_at=now - timedelta(days=5), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[16], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(days=5), completed_at=now - timedelta(days=4), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[20], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=4), completed_at=now - timedelta(days=3), progress=100),
        ChildTask(child=Link(emma, Child), task=Link(tasks[24], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        
        
        # Tasks waiting for verification
        ChildTask(child=Link(emma, Child), task=Link(tasks[1], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=1), progress=100, notes="Completed morning routine"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[13], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=1), progress=100, notes="Story about a magic garden"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[17], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=12), progress=100, notes="Helped friend with homework"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[20], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=8), progress=100, notes="Read for 20 minutes"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[25], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=4), progress=100, notes="Did 3 kind things today"),
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[5], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=5), due_date=now + timedelta(days=1), progress=60, notes="Working on problem 3/5", unity_type=ChildTaskUnityType.CHOICE),
        ChildTask(child=Link(emma, Child), task=Link(tasks[21], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=3), due_date=now + timedelta(days=1), progress=40, notes="Read 8/20 minutes", unity_type=ChildTaskUnityType.CHOICE),
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.GIVEUP, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=3), progress=30, notes="Too difficult", unity_type=ChildTaskUnityType.TALK),
        
        
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
        
        
        # Tasks waiting for verification
        ChildTask(child=Link(lucas, Child), task=Link(tasks[14], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=1), progress=100, notes="Built a robot castle"),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=10), progress=100, notes="Solved pattern puzzle"),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[7], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=6), progress=100, notes="Completed sudoku"),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[27], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=2), progress=100, notes="Won memory game"),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[22], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=4), due_date=now + timedelta(days=1), progress=70, notes="Almost done with homework", unity_type=ChildTaskUnityType.CHOICE),
        ChildTask(child=Link(lucas, Child), task=Link(tasks[6], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=2), due_date=now + timedelta(days=2), progress=30, unity_type=ChildTaskUnityType.CHOICE),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[4], Task), status=ChildTaskStatus.GIVEUP, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=2), progress=20, notes="Not interested", unity_type=ChildTaskUnityType.TALK),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[8], Task), status=ChildTaskStatus.UNASSIGNED, priority=ChildTaskPriority.MEDIUM, assigned_at=now, unity_type=ChildTaskUnityType.CHOICE),
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[2], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now, due_date=now + timedelta(days=2), unity_type=ChildTaskUnityType.LIFE),
    ]
    child_tasks.extend(lucas_tasks)
    
    
    sophia_tasks = [
        
        ChildTask(child=Link(sophia, Child), task=Link(tasks[0], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        ChildTask(child=Link(sophia, Child), task=Link(tasks[8], Task), status=ChildTaskStatus.COMPLETED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=2), completed_at=now - timedelta(days=1), progress=100),
        
        # Tasks waiting for verification
        ChildTask(child=Link(sophia, Child), task=Link(tasks[16], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=6), progress=100, notes="Said thank you to teacher"),
        ChildTask(child=Link(sophia, Child), task=Link(tasks[10], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=3), progress=100, notes="Did 20 jumping jacks"),
        
        ChildTask(child=Link(sophia, Child), task=Link(tasks[24], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=3)),
    ]
    child_tasks.extend(sophia_tasks)
    
    
    alex_tasks = [
        ChildTask(child=Link(alex, Child), task=Link(tasks[21], Task), status=ChildTaskStatus.COMPLETED, assigned_at=now - timedelta(days=4), completed_at=now - timedelta(days=3), progress=100),
        ChildTask(child=Link(alex, Child), task=Link(tasks[22], Task), status=ChildTaskStatus.COMPLETED, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        
        # Tasks waiting for verification
        ChildTask(child=Link(alex, Child), task=Link(tasks[5], Task), status=ChildTaskStatus.NEED_VERIFY, assigned_at=now - timedelta(hours=8), progress=100, notes="Completed math challenge"),
        ChildTask(child=Link(alex, Child), task=Link(tasks[14], Task), status=ChildTaskStatus.NEED_VERIFY, assigned_at=now - timedelta(hours=2), progress=100, notes="Built creative structure"),
        
        ChildTask(child=Link(alex, Child), task=Link(tasks[25], Task), status=ChildTaskStatus.IN_PROGRESS, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=1), progress=60),
    ]
    child_tasks.extend(alex_tasks)
    
    await ChildTask.insert_many(child_tasks)
    print(f"   ✓ Created {len(child_tasks)} assigned tasks across all children\n")

    
    
    
    print("🏆 Giving earned rewards to children...")
    
    
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
    print(f"   ✓ Created {len(child_rewards_list)} owned rewards\n")

    
    
    
    print("🛒 Creating redemption requests...")
    
    # Get item rewards (redeemable rewards)
    item_rewards = [r for r in rewards if r.type == RewardType.ITEM]
    
    redemption_requests = [
        # Pending requests - need parent approval
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[0], Reward),  # Favorite Snack
            cost_coins=30,
            status="pending",
            requested_at=now - timedelta(hours=5)
        ),
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[1], Reward),  # 30 Min Extra Screen Time
            cost_coins=50,
            status="pending",
            requested_at=now - timedelta(hours=3)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[0], Reward),  # Favorite Snack
            cost_coins=30,
            status="pending",
            requested_at=now - timedelta(hours=8)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[2], Reward),  # Movie Night Choice
            cost_coins=80,
            status="pending",
            requested_at=now - timedelta(hours=2)
        ),
        RedemptionRequest(
            child=Link(sophia, Child),
            reward=Link(item_rewards[0], Reward),  # Favorite Snack
            cost_coins=30,
            status="pending",
            requested_at=now - timedelta(hours=1)
        ),
        RedemptionRequest(
            child=Link(alex, Child),
            reward=Link(item_rewards[1], Reward),  # 30 Min Extra Screen Time
            cost_coins=50,
            status="pending",
            requested_at=now - timedelta(hours=4)
        ),
        
        # Approved requests - already processed
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[0], Reward),  # Favorite Snack
            cost_coins=30,
            status="approved",
            requested_at=now - timedelta(days=2, hours=3),
            processed_at=now - timedelta(days=2, hours=2),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[1], Reward),  # 30 Min Extra Screen Time
            cost_coins=50,
            status="approved",
            requested_at=now - timedelta(days=1, hours=5),
            processed_at=now - timedelta(days=1, hours=4),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(sophia, Child),
            reward=Link(item_rewards[0], Reward),  # Favorite Snack
            cost_coins=30,
            status="approved",
            requested_at=now - timedelta(days=1, hours=2),
            processed_at=now - timedelta(days=1, hours=1),
            processed_by=str(demo_user.id)
        ),
        
        # Rejected requests - parent declined
        RedemptionRequest(
            child=Link(emma, Child),
            reward=Link(item_rewards[4], Reward),  # New Toy (too expensive)
            cost_coins=200,
            status="rejected",
            requested_at=now - timedelta(days=1, hours=8),
            processed_at=now - timedelta(days=1, hours=7),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(lucas, Child),
            reward=Link(item_rewards[5], Reward),  # Special Outing (too expensive)
            cost_coins=300,
            status="rejected",
            requested_at=now - timedelta(days=2, hours=4),
            processed_at=now - timedelta(days=2, hours=3),
            processed_by=str(demo_user.id)
        ),
        RedemptionRequest(
            child=Link(alex, Child),
            reward=Link(item_rewards[3], Reward),  # Ice Cream Trip
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
    print(f"   ✓ Created {len(redemption_requests)} redemption requests (pending: {pending_count}, approved: {approved_count}, rejected: {rejected_count})\n")

    
    
    
    print("🎮 Creating mini games...")
    
    games = [
        MiniGame(name="Logic Master", description="Solve puzzles to improve logic skills", linked_skill="Logic"),
        MiniGame(name="Creative Canvas", description="Express yourself through art and stories", linked_skill="Creativity"),
        MiniGame(name="Social Connect", description="Practice social situations and empathy", linked_skill="Social"),
        MiniGame(name="Math Adventure", description="Fun math challenges and quizzes", linked_skill="Academic"),
        MiniGame(name="Emotion Explorer", description="Learn to identify and manage emotions", linked_skill="EQ"),
        MiniGame(name="Memory Challenge", description="Train your memory with fun games", linked_skill="Logic"),
    ]
    
    await MiniGame.insert_many(games)
    print(f"   ✓ Created {len(games)} mini games\n")

    
    
    
    print("🕹️  Creating game session history...")
    
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
    print(f"   ✓ Created {len(game_sessions)} game sessions\n")

    
    
    
    print("💬 Creating interaction logs...")
    
    interactions = [
        
        # Emma's interactions - diverse emotions
        InteractionLog(
            child=Link(emma, Child),
            user_input="Hi! How are you today?",
            avatar_response="Hello Emma! I'm doing great! I see you completed your reading task today. That's wonderful! 📚",
            detected_emotion="Happy",
            timestamp=now - timedelta(days=2, hours=5)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I'm feeling creative today!",
            avatar_response="That's amazing! Your creativity is one of your superpowers! Maybe you could try the creative writing task? ✨",
            detected_emotion="Excited",
            timestamp=now - timedelta(days=2, hours=4)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Can you help me with my math homework?",
            avatar_response="Of course! Let's break it down step by step. What's the problem you're working on?",
            detected_emotion="Curious",
            timestamp=now - timedelta(days=1, hours=6)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I finished my story!",
            avatar_response="That's fantastic! I'm so proud of you for completing your creative writing task! 🌟",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=1, hours=3)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Math is so hard for me",
            avatar_response="I understand math can be challenging. But remember, you're getting better every day! Let's practice together.",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(days=1, hours=2)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I helped my friend today!",
            avatar_response="That's so kind of you! Helping others makes you feel good, doesn't it? You're such a caring person! 💕",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=8)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="What should I do next?",
            avatar_response="You have a few tasks waiting! How about trying the pattern puzzle? It's fun and will help with your math skills!",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=4)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I got a new sticker today!",
            avatar_response="That's wonderful! Stickers are so fun to collect. What kind of sticker was it?",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=3, minutes=30)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Can you tell me a story?",
            avatar_response="Of course! Once upon a time, there was a brave little girl who loved to explore... Would you like me to continue?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=2, minutes=45)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I'm worried about my test tomorrow",
            avatar_response="It's normal to feel worried before a test. You've been studying hard, and I believe in you! Want to practice together?",
            detected_emotion="Worried",
            timestamp=now - timedelta(hours=2, minutes=15)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I drew a picture of you!",
            avatar_response="Aww, that's so sweet! I'd love to see it. Drawing is such a wonderful way to express yourself! 🎨",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=1, minutes=50)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="What's your favorite color?",
            avatar_response="I love all colors, but I'm particularly fond of blue and purple! What about you? What's your favorite?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=1, minutes=20)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I'm so excited for the weekend!",
            avatar_response="Weekends are the best! What fun things are you planning to do? I'm excited for you too! 🎉",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=45, minutes=30)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="My friend was mean to me today",
            avatar_response="I'm sorry that happened. That must have felt hurtful. Would you like to talk about it? Sometimes friends have bad days too.",
            detected_emotion="Sad",
            timestamp=now - timedelta(hours=30, minutes=15)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I learned a new word today!",
            avatar_response="That's fantastic! Learning new words is like collecting treasures for your mind. What word did you learn?",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=20, minutes=10)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Can we count together?",
            avatar_response="Absolutely! Let's count: 1, 2, 3... How high can we go? This is great practice for your math skills!",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=15, minutes=5)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I'm scared of the dark",
            avatar_response="It's okay to feel scared sometimes. Many children feel that way. Would you like some tips to help you feel braver?",
            detected_emotion="Scared",
            timestamp=now - timedelta(hours=10, minutes=40)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I want to be a teacher when I grow up!",
            avatar_response="What a wonderful dream! Teachers help others learn and grow. I think you'd be an amazing teacher! 🌟",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=5, minutes=25)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I'm angry because I lost my toy",
            avatar_response="I understand you're feeling angry. Losing something important can be really frustrating. Let's think about where you last saw it.",
            detected_emotion="Angry",
            timestamp=now - timedelta(hours=3, minutes=50)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Thank you for being my friend",
            avatar_response="You're so welcome! I'm honored to be your friend. You're such a kind and wonderful person! 💕",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=45)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="What do robots eat?",
            avatar_response="Haha, that's a funny question! Robots don't eat food like we do - they need electricity to work. But I love your curiosity!",
            detected_emotion="Curious",
            timestamp=now - timedelta(minutes=20)
        ),
        
        
        # Lucas's interactions
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I built a robot today!",
            avatar_response="Wow Lucas! That sounds incredible! You're so good at building things. Tell me more about your robot! 🤖",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=3, hours=4)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I don't want to do my homework",
            avatar_response="I understand it can feel boring sometimes. How about we make it fun? We can turn it into a game! What subject is it?",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(days=1, hours=8)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Thank you for helping me!",
            avatar_response="You're welcome, Lucas! I'm always here to help you. You did great work today! 🌟",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=5)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I solved the puzzle!",
            avatar_response="Excellent work! Your problem-solving skills are amazing! You should be very proud! 🎉",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=2, hours=6)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I'm not good at talking to other kids",
            avatar_response="That's okay! Making friends takes practice. Would you like some tips on how to start conversations?",
            detected_emotion="Worried",
            timestamp=now - timedelta(days=1, hours=4)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Can we do more logic puzzles?",
            avatar_response="Absolutely! I love that you enjoy logic puzzles. They're great for your brain! Let me find some for you.",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=3)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I finished my math homework",
            avatar_response="Great job! You worked really hard on that. How do you feel about it now?",
            detected_emotion="Neutral",
            timestamp=now - timedelta(hours=2)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I want to build a computer",
            avatar_response="Wow, that's an ambitious project! Building computers is really cool. What kind of computer do you want to build?",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=1, minutes=40)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Why is the sky blue?",
            avatar_response="Great question! The sky looks blue because of how sunlight scatters in the atmosphere. Want to learn more about it?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=1, minutes=10)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I'm frustrated with this puzzle",
            avatar_response="It's okay to feel frustrated. Puzzles can be tricky! Let's take a break and come back to it with fresh eyes.",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(hours=50, minutes=30)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I won the science fair!",
            avatar_response="Congratulations! That's an amazing achievement! You must be so proud of yourself. Tell me about your project! 🏆",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=40, minutes=20)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Can you explain how robots work?",
            avatar_response="Robots are machines that can follow instructions and do tasks. They use sensors, motors, and computer programs. Want to learn more?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=35, minutes=15)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I'm worried about making mistakes",
            avatar_response="Everyone makes mistakes - that's how we learn! Even the smartest people make mistakes. What matters is that we try again.",
            detected_emotion="Worried",
            timestamp=now - timedelta(hours=25, minutes=45)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I built a tower with blocks",
            avatar_response="That sounds awesome! Building things helps develop your problem-solving skills. How tall did you make it?",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=18, minutes=30)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Math is my favorite subject",
            avatar_response="That's wonderful! Math is like solving puzzles and mysteries. I'm glad you enjoy it! Keep up the great work!",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=12, minutes=20)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I don't understand this problem",
            avatar_response="That's okay! Let's work through it together step by step. What part is confusing you?",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(hours=8, minutes=10)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Can we do more science experiments?",
            avatar_response="Absolutely! Science experiments are so much fun! They help us understand how the world works. What would you like to try?",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=6, minutes=35)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I'm scared of thunderstorms",
            avatar_response="Thunderstorms can be loud and scary, but they're actually just nature's way of balancing things. You're safe inside!",
            detected_emotion="Scared",
            timestamp=now - timedelta(hours=4, minutes=50)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I want to be a scientist",
            avatar_response="That's an amazing goal! Scientists discover new things and help make the world better. I think you'd be great at it! 🔬",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=2, minutes=25)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I'm angry because I can't solve this",
            avatar_response="I understand you're feeling angry. Sometimes when things are hard, we need to take a break. Want to try a different approach?",
            detected_emotion="Angry",
            timestamp=now - timedelta(hours=1, minutes=15)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Thank you for helping me learn",
            avatar_response="You're very welcome! I love helping you learn. You're doing such a great job! Keep asking questions! 🌟",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=30)
        ),
        
        
        # Sophia's interactions
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I want to play!",
            avatar_response="Yay! Let's play together! Which game would you like to try? We have so many fun games! 🎮",
            detected_emotion="Excited",
            timestamp=now - timedelta(days=2, hours=3)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I made my bed all by myself!",
            avatar_response="That's so awesome, Sophia! You're such a big helper! I'm so proud of you! ⭐",
            detected_emotion="Proud",
            timestamp=now - timedelta(days=1, hours=10)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I danced today!",
            avatar_response="That sounds so fun! Dancing is a great way to express yourself and stay active! 💃",
            detected_emotion="Excited",
            timestamp=now - timedelta(days=1, hours=7)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I said thank you to my teacher!",
            avatar_response="That's wonderful! Being polite and grateful is so important. You're learning great social skills! 🌟",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=6)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Can we play outside?",
            avatar_response="That sounds like a great idea! Outdoor play is so much fun and good for you!",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=1)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I made a new friend at school!",
            avatar_response="That's wonderful! Making new friends is so exciting! What's your new friend's name?",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=55, minutes=20)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I can do a cartwheel now!",
            avatar_response="Wow! That's amazing! Cartwheels are so fun. You must have practiced really hard! 🎉",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=48, minutes=10)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Why do we have to go to bed early?",
            avatar_response="Sleep helps our bodies and brains grow strong! When we sleep well, we have more energy to play and learn!",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=42, minutes=30)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I'm so happy today!",
            avatar_response="I'm so glad you're happy! Your happiness makes me happy too! What made you feel so good today? 😊",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=36, minutes=15)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Can we sing a song together?",
            avatar_response="I'd love to sing with you! Music is so joyful. What song would you like to sing? 🎵",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=28, minutes=45)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I'm worried about my dance recital",
            avatar_response="It's normal to feel worried before performing! But you've practiced so much, and I know you'll do great!",
            detected_emotion="Worried",
            timestamp=now - timedelta(hours=22, minutes=20)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I helped mommy cook dinner!",
            avatar_response="That's so helpful! Cooking together is such a fun way to spend time. What did you help make? 👨‍🍳",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=16, minutes=50)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I want to be a ballerina!",
            avatar_response="What a beautiful dream! Ballerinas are so graceful and strong. Keep practicing your dance moves! 💃",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=11, minutes=35)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I'm sad because my friend moved away",
            avatar_response="I'm sorry your friend moved away. That must feel really sad. You can still be friends even when far apart!",
            detected_emotion="Sad",
            timestamp=now - timedelta(hours=7, minutes=25)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="Can we play hide and seek?",
            avatar_response="Hide and seek is so much fun! Ready or not, here I come! Where's a good hiding spot? 🎮",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=4, minutes=10)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I'm scared of big dogs",
            avatar_response="It's okay to feel scared. Some dogs are big, but most are friendly when we're calm. Would you like tips on meeting dogs?",
            detected_emotion="Scared",
            timestamp=now - timedelta(hours=2, minutes=40)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I shared my snack with a friend",
            avatar_response="That's so kind of you! Sharing shows you're a great friend. How did it make you feel? 💕",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=55)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I'm angry because I can't find my toy",
            avatar_response="I understand you're feeling angry. Let's take a deep breath and think about where you last played with it.",
            detected_emotion="Angry",
            timestamp=now - timedelta(minutes=25)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="What's your favorite game?",
            avatar_response="I love all games, but I especially enjoy games that help us learn and have fun together! What's yours?",
            detected_emotion="Curious",
            timestamp=now - timedelta(minutes=10)
        ),
        
        
        # Alex's interactions
        InteractionLog(
            child=Link(alex, Child),
            user_input="What tasks should I do today?",
            avatar_response="Let me check your list, Alex! You have reading and math practice. Which one would you like to start with?",
            detected_emotion="Neutral",
            timestamp=now - timedelta(days=1, hours=9)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I finished reading my book!",
            avatar_response="That's great! Reading helps you learn so much. What was your favorite part?",
            detected_emotion="Happy",
            timestamp=now - timedelta(days=1, hours=5)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Math is interesting",
            avatar_response="I'm glad you think so! Math can be really fun when you understand it. Keep up the great work!",
            detected_emotion="Curious",
            timestamp=now - timedelta(days=1, hours=2)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I learned how to code today!",
            avatar_response="That's fantastic! Coding is like giving instructions to computers. What did you create? 💻",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=22, minutes=30)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Can you help me with my project?",
            avatar_response="Of course! I'd be happy to help. What kind of project are you working on?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=19, minutes=15)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I'm excited about the school trip!",
            avatar_response="School trips are so much fun! Where are you going? I bet you'll learn lots of interesting things! 🎒",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=15, minutes=45)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I'm worried I won't do well on the test",
            avatar_response="It's normal to feel worried, but you've been studying hard! Remember, doing your best is what matters most.",
            detected_emotion="Worried",
            timestamp=now - timedelta(hours=12, minutes=20)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I finished all my homework!",
            avatar_response="Excellent work! Finishing all your homework shows great responsibility. You should be proud! 🌟",
            detected_emotion="Proud",
            timestamp=now - timedelta(hours=9, minutes=50)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Why do we need to learn history?",
            avatar_response="Great question! History helps us understand how the world became what it is today. It's like a story of our past!",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=6, minutes=35)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I'm frustrated with this coding problem",
            avatar_response="Coding can be tricky sometimes! When we get stuck, it helps to break the problem into smaller parts. Want to try?",
            detected_emotion="Frustrated",
            timestamp=now - timedelta(hours=4, minutes=10)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I want to build a video game",
            avatar_response="That's an awesome goal! Building games combines creativity and logic. What kind of game would you make? 🎮",
            detected_emotion="Excited",
            timestamp=now - timedelta(hours=2, minutes=55)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I'm sad because I lost my game",
            avatar_response="I'm sorry you lost. Losing can feel disappointing, but remember - every game is a chance to learn and improve!",
            detected_emotion="Sad",
            timestamp=now - timedelta(hours=1, minutes=30)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Can you explain how computers work?",
            avatar_response="Computers are amazing! They use electricity to process information and follow instructions. Want to learn more?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=50, minutes=20)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I'm scared of making mistakes",
            avatar_response="Everyone makes mistakes - that's how we learn! Even the best programmers make mistakes. What matters is trying again!",
            detected_emotion="Scared",
            timestamp=now - timedelta(hours=38, minutes=15)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I'm angry because my code doesn't work",
            avatar_response="I understand you're feeling angry. Debugging code can be frustrating. Let's look at it together step by step.",
            detected_emotion="Angry",
            timestamp=now - timedelta(hours=25, minutes=40)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I helped my friend with homework",
            avatar_response="That's so kind of you! Helping others is a wonderful thing to do. How did it make you feel?",
            detected_emotion="Happy",
            timestamp=now - timedelta(hours=14, minutes=25)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="What's the biggest number?",
            avatar_response="That's a fun question! Numbers go on forever - there's no biggest number! Want to explore really big numbers?",
            detected_emotion="Curious",
            timestamp=now - timedelta(hours=8, minutes=5)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="I want to be a programmer",
            avatar_response="That's a fantastic goal! Programmers create amazing things with code. Keep learning and practicing! 💻",
            detected_emotion="Excited",
            timestamp=now - timedelta(minutes=40)
        ),
        InteractionLog(
            child=Link(alex, Child),
            user_input="Thank you for teaching me",
            avatar_response="You're so welcome! I love helping you learn. You're doing such a great job asking questions! 🌟",
            detected_emotion="Happy",
            timestamp=now - timedelta(minutes=15)
        ),
    ]
    
    await InteractionLog.insert_many(interactions)
    print(f"   ✓ Created {len(interactions)} interaction logs with emotion detection\n")

    
    
    
    print("📊 Creating progress reports...")
    
    reports_list = [
        
        Report(
            child=Link(emma, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Emma has shown excellent progress this period! She completed 11 tasks across multiple categories, demonstrating strong skills in creativity and emotional intelligence. Her completion rate of 85% is outstanding. She's particularly excelling in creative tasks and showing great improvement in logic puzzles. Her emotional state reflects a positive and engaged learner, with moments of curiosity and occasional frustration when facing challenging tasks, which is completely normal and shows her growth mindset.",
            insights={
                "tasks_completed": 11,
                "tasks_verified": 9,
                "coins_earned": 245,
                "completion_rate": 85,
                "most_active_category": "Creativity",
                "strengths": ["creativity", "emotional awareness", "communication", "consistency"],
                "areas_for_improvement": ["math skills", "time management"],
                "emotion_trends": {"Happy": 35, "Excited": 25, "Curious": 20, "Proud": 15, "Frustrated": 5},
                "most_common_emotion": "Happy",
                "emotional_analysis": "Emma displays a predominantly positive emotional state throughout this period. Her high completion rate and engagement in creative tasks suggest she feels confident and motivated. The presence of 'Happy' and 'Excited' emotions (60% combined) indicates she enjoys her learning journey. Occasional 'Frustrated' moments (5%) are natural when facing math challenges, but her persistence shows emotional resilience. Her 'Curious' and 'Proud' emotions demonstrate healthy self-awareness and a growth mindset."
            },
            suggestions={
                "focus": "Continue nurturing creativity while building confidence in math",
                "recommended_tasks": ["Math Challenge", "Logic Riddle", "Pattern Puzzle"],
                "games": "Try Logic Master game to improve problem-solving skills",
                "parenting_tips": "Praise effort in challenging subjects, celebrate creative achievements. When she shows frustration with math, acknowledge her feelings and break tasks into smaller steps."
            }
        ),
        
        
        Report(
            child=Link(lucas, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Lucas continues to excel in logic and problem-solving tasks. He completed 8 tasks with a 75% completion rate. His focus and analytical skills are his greatest strengths. However, we notice he could benefit from more social interaction tasks to build confidence. His emotional patterns show pride in his achievements, especially in logic puzzles, but also reveal some worry about social interactions, which is an area for gentle support and encouragement.",
            insights={
                "tasks_completed": 8,
                "tasks_verified": 7,
                "coins_earned": 170,
                "completion_rate": 75,
                "most_active_category": "Logic",
                "strengths": ["logic", "problem-solving", "focus", "analytical thinking"],
                "areas_for_improvement": ["social skills", "physical activities", "expressing emotions"],
                "emotion_trends": {"Proud": 30, "Curious": 25, "Happy": 20, "Neutral": 15, "Frustrated": 5, "Worried": 5},
                "most_common_emotion": "Proud",
                "emotional_analysis": "Lucas shows a balanced emotional profile with strong positive emotions around his achievements. His 'Proud' emotion (30%) is most common, reflecting his satisfaction with logic and problem-solving tasks. 'Curious' (25%) indicates his natural interest in learning and exploration. The presence of 'Worried' (5%) suggests some anxiety around social situations, which is common for analytical children. His overall emotional state is stable and positive, with room to grow in social confidence through targeted activities."
            },
            suggestions={
                "focus": "Encourage social tasks and emotional expression activities",
                "recommended_tasks": ["Help a Friend", "Share Your Toys", "Name Your Feelings"],
                "games": "Social Connect game to practice social scenarios",
                "parenting_tips": "Create opportunities for peer interaction, validate emotions. Celebrate his logic achievements while gently encouraging social activities. Help him understand that it's okay to feel worried sometimes."
            }
        ),
        
        
        Report(
            child=Link(sophia, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Sophia is off to a great start! She's showing enthusiasm and energy in all tasks. Completed 5 tasks with 100% verification rate. Her social skills and confidence shine through. As she's just starting, we're focusing on building routines and celebrating every achievement. Her emotional state is overwhelmingly positive, with high levels of excitement and happiness, which reflects her energetic and confident personality.",
            insights={
                "tasks_completed": 5,
                "tasks_verified": 5,
                "coins_earned": 80,
                "completion_rate": 100,
                "most_active_category": "Independence",
                "strengths": ["confidence", "social skills", "energy", "enthusiasm"],
                "areas_for_improvement": ["patience", "quiet activities", "focus"],
                "emotion_trends": {"Excited": 50, "Happy": 30, "Proud": 20},
                "most_common_emotion": "Excited",
                "emotional_analysis": "Sophia displays an exceptionally positive and energetic emotional profile. Her dominant emotion is 'Excited' (50%), which perfectly matches her energetic personality and enthusiasm for new activities. Combined with 'Happy' (30%) and 'Proud' (20%), she shows 100% positive emotions, indicating a very confident and motivated learner. This emotional state suggests she feels successful and enjoys the learning process. Her high completion rate and positive emotions indicate she's ready for slightly more challenging tasks while maintaining her enthusiasm."
            },
            suggestions={
                "focus": "Build foundational routines and gradually introduce quiet activities",
                "recommended_tasks": ["Read for 20 Minutes", "Calm Down Practice", "Build with Blocks"],
                "games": "Memory Challenge to improve focus and patience",
                "parenting_tips": "Celebrate early wins, establish consistent routines. Channel her excitement into structured activities. Introduce quiet time gradually to help with focus and patience."
            }
        ),
    ]
    
    await Report.insert_many(reports_list)
    print(f"   ✓ Created {len(reports_list)} progress reports\n")

    
    
    
    print("="*60)
    print("✅ SEEDING COMPLETED SUCCESSFULLY!")
    print("="*60)
    print(f"""
📈 Database Statistics:
   • Parent Users: 3 (demo@kiddymate.com, parent1/2@example.com)
   • Child Accounts: 2 (emma@kiddymate.com, lucas@kiddymate.com)
   • Children Profiles: 4 (Emma, Lucas, Sophia, Alex)
   • Tasks in Library: {len(tasks)} (with unity types)
   • Assigned Tasks: {len(child_tasks)} (all status types)
   • Rewards: {len(rewards)} (badges, skins, items)
   • Owned Rewards: {len(child_rewards_list)}
   • Mini Games: {len(games)}
   • Game Sessions: {len(game_sessions)}
   • Interactions: {len(interactions)}
   • Reports: {len(reports_list)}
   • Assessments: {len(assessments) if 'assessments' in locals() else 0}
   • Redemption Requests: {len(redemption_requests) if 'redemption_requests' in locals() else 0}

🔑 Login Credentials:
   Parent Accounts:
   - Email: demo@kiddymate.com / Password: demo123
   - Email: parent1@example.com / Password: password123
   - Email: parent2@example.com / Password: password123
   
   Child Accounts:
   - Email: emma@kiddymate.com / Password: emma123
   - Email: lucas@kiddymate.com / Password: lucas123

📝 New Features Covered:
   ✓ User roles (parent/child)
   ✓ Child accounts linked to profiles
   ✓ Unity types (life, choice, talk) for tasks
   ✓ Task statuses: unassigned, giveup
   ✓ Assessments for LLM context

📝 Features Covered:
   ✓ Dashboard with real stats & charts
   ✓ Task Center (library, assigned, all statuses)
   ✓ Reward Center (shop items, redemptions)
   ✓ Settings (profiles, notifications)
   ✓ Game sessions with history
   ✓ Chat interaction logs
   ✓ Weekly progress reports
   
🎯 Ready to test all workflows!
    """)


if __name__ == "__main__":
    asyncio.run(seed_database())
