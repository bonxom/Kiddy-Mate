from beanie import Document

class MiniGame(Document):
    name: str
    description: str
    linked_skill: str

    class Settings:
        name = "mini_games"