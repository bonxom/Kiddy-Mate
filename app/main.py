from fastapi import FastAPI
from controller.permission_controller import router as permission_router  
from controller.role_controller import router as role_router 
from config.database import get_database  


app = FastAPI(title="KiddyMate API")


@app.on_event("startup")
async def startup_event():
    db = get_database()
    await db.command({"ping": 1})
    print("connected to MongoDB")



app.include_router(permission_router)
app.include_router(role_router)
