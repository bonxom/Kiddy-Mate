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
            User, Child, Task, Reward, ChildReward, MiniGame, 
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
        
        
        ChildTask(child=Link(emma, Child), task=Link(tasks[1], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(days=1), progress=100, notes="Completed morning routine"),
        ChildTask(child=Link(emma, Child), task=Link(tasks[13], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=1), progress=100, notes="Story about a magic garden"),
        
        
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
        
        
        ChildTask(child=Link(lucas, Child), task=Link(tasks[14], Task), status=ChildTaskStatus.NEED_VERIFY, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(days=1), progress=100, notes="Built a robot castle"),
        
        
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
        
        
        ChildTask(child=Link(sophia, Child), task=Link(tasks[16], Task), status=ChildTaskStatus.IN_PROGRESS, priority=ChildTaskPriority.HIGH, assigned_at=now - timedelta(hours=6), due_date=now + timedelta(days=1), progress=50, notes="Said thank you to teacher"),
        
        
        ChildTask(child=Link(sophia, Child), task=Link(tasks[10], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.MEDIUM, assigned_at=now - timedelta(hours=2), due_date=now + timedelta(days=2)),
        ChildTask(child=Link(sophia, Child), task=Link(tasks[24], Task), status=ChildTaskStatus.ASSIGNED, priority=ChildTaskPriority.LOW, assigned_at=now - timedelta(hours=1), due_date=now + timedelta(days=3)),
    ]
    child_tasks.extend(sophia_tasks)
    
    
    alex_tasks = [
        ChildTask(child=Link(alex, Child), task=Link(tasks[21], Task), status=ChildTaskStatus.COMPLETED, assigned_at=now - timedelta(days=4), completed_at=now - timedelta(days=3), progress=100),
        ChildTask(child=Link(alex, Child), task=Link(tasks[22], Task), status=ChildTaskStatus.COMPLETED, assigned_at=now - timedelta(days=3), completed_at=now - timedelta(days=2), progress=100),
        ChildTask(child=Link(alex, Child), task=Link(tasks[5], Task), status=ChildTaskStatus.IN_PROGRESS, assigned_at=now - timedelta(hours=8), due_date=now + timedelta(days=1), progress=80),
        ChildTask(child=Link(alex, Child), task=Link(tasks[14], Task), status=ChildTaskStatus.ASSIGNED, assigned_at=now - timedelta(hours=2), due_date=now + timedelta(days=2)),
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
        
        InteractionLog(
            child=Link(emma, Child),
            user_input="Hi! How are you today?",
            avatar_response="Hello Emma! I'm doing great! I see you completed your reading task today. That's wonderful! 📚",
            detected_emotion="happy",
            timestamp=now - timedelta(days=2, hours=5)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="I'm feeling creative today!",
            avatar_response="That's amazing! Your creativity is one of your superpowers! Maybe you could try the creative writing task? ✨",
            detected_emotion="excited",
            timestamp=now - timedelta(days=2, hours=4)
        ),
        InteractionLog(
            child=Link(emma, Child),
            user_input="Can you help me with my math homework?",
            avatar_response="Of course! Let's break it down step by step. What's the problem you're working on?",
            detected_emotion="curious",
            timestamp=now - timedelta(days=1, hours=6)
        ),
        
        
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I built a robot today!",
            avatar_response="Wow Lucas! That sounds incredible! You're so good at building things. Tell me more about your robot! 🤖",
            detected_emotion="proud",
            timestamp=now - timedelta(days=3, hours=4)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="I don't want to do my homework",
            avatar_response="I understand it can feel boring sometimes. How about we make it fun? We can turn it into a game! What subject is it?",
            detected_emotion="frustrated",
            timestamp=now - timedelta(days=1, hours=8)
        ),
        InteractionLog(
            child=Link(lucas, Child),
            user_input="Thank you for helping me!",
            avatar_response="You're welcome, Lucas! I'm always here to help you. You did great work today! 🌟",
            detected_emotion="grateful",
            timestamp=now - timedelta(hours=5)
        ),
        
        
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I want to play!",
            avatar_response="Yay! Let's play together! Which game would you like to try? We have so many fun games! 🎮",
            detected_emotion="excited",
            timestamp=now - timedelta(days=2, hours=3)
        ),
        InteractionLog(
            child=Link(sophia, Child),
            user_input="I made my bed all by myself!",
            avatar_response="That's so awesome, Sophia! You're such a big helper! I'm so proud of you! ⭐",
            detected_emotion="proud",
            timestamp=now - timedelta(days=1, hours=10)
        ),
        
        
        InteractionLog(
            child=Link(alex, Child),
            user_input="What tasks should I do today?",
            avatar_response="Let me check your list, Alex! You have reading and math practice. Which one would you like to start with?",
            detected_emotion="neutral",
            timestamp=now - timedelta(days=1, hours=9)
        ),
    ]
    
    await InteractionLog.insert_many(interactions)
    print(f"   ✓ Created {len(interactions)} interaction logs\n")

    
    
    
    print("📊 Creating progress reports...")
    
    reports_list = [
        
        Report(
            child=Link(emma, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Emma has shown excellent progress this period! She completed 11 tasks across multiple categories, demonstrating strong skills in creativity and emotional intelligence. Her completion rate of 85% is outstanding. She's particularly excelling in creative tasks and showing great improvement in logic puzzles.",
            insights={
                "tasks_completed": 11,
                "tasks_verified": 9,
                "coins_earned": 245,
                "completion_rate": 85,
                "most_active_category": "Creativity",
                "strengths": ["creativity", "emotional awareness", "communication", "consistency"],
                "areas_for_improvement": ["math skills", "time management"],
                "emotion_trends": {"happy": 45, "excited": 30, "curious": 15, "frustrated": 10}
            },
            suggestions={
                "focus": "Continue nurturing creativity while building confidence in math",
                "recommended_tasks": ["Math Challenge", "Logic Riddle", "Pattern Puzzle"],
                "games": "Try Logic Master game to improve problem-solving skills",
                "parenting_tips": "Praise effort in challenging subjects, celebrate creative achievements"
            }
        ),
        
        
        Report(
            child=Link(lucas, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Lucas continues to excel in logic and problem-solving tasks. He completed 8 tasks with a 75% completion rate. His focus and analytical skills are his greatest strengths. However, we notice he could benefit from more social interaction tasks to build confidence.",
            insights={
                "tasks_completed": 8,
                "tasks_verified": 7,
                "coins_earned": 170,
                "completion_rate": 75,
                "most_active_category": "Logic",
                "strengths": ["logic", "problem-solving", "focus", "analytical thinking"],
                "areas_for_improvement": ["social skills", "physical activities", "expressing emotions"],
                "emotion_trends": {"curious": 40, "proud": 25, "neutral": 20, "frustrated": 15}
            },
            suggestions={
                "focus": "Encourage social tasks and emotional expression activities",
                "recommended_tasks": ["Help a Friend", "Share Your Toys", "Name Your Feelings"],
                "games": "Social Connect game to practice social scenarios",
                "parenting_tips": "Create opportunities for peer interaction, validate emotions"
            }
        ),
        
        
        Report(
            child=Link(sophia, Child),
            period_start=datetime(2025, 11, 1),
            period_end=datetime(2025, 11, 15),
            generated_at=datetime(2025, 11, 16),
            summary_text="Sophia is off to a great start! She's showing enthusiasm and energy in all tasks. Completed 5 tasks with 100% verification rate. Her social skills and confidence shine through. As she's just starting, we're focusing on building routines and celebrating every achievement.",
            insights={
                "tasks_completed": 5,
                "tasks_verified": 5,
                "coins_earned": 80,
                "completion_rate": 100,
                "most_active_category": "Independence",
                "strengths": ["confidence", "social skills", "energy", "enthusiasm"],
                "areas_for_improvement": ["patience", "quiet activities", "focus"],
                "emotion_trends": {"excited": 50, "happy": 35, "proud": 15}
            },
            suggestions={
                "focus": "Build foundational routines and gradually introduce quiet activities",
                "recommended_tasks": ["Read for 20 Minutes", "Calm Down Practice", "Build with Blocks"],
                "games": "Memory Challenge to improve focus and patience",
                "parenting_tips": "Celebrate early wins, establish consistent routines"
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
