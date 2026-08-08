from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.core.logging import logger


class DatabaseManager:
    """Async MongoDB Database Manager using Motor driver with production connection pooling."""
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db_manager = DatabaseManager()


async def connect_to_mongo():
    """Establish async MongoDB connection with production connection pool configuration."""
    logger.info(f"Connecting to MongoDB database: '{settings.MONGODB_DB_NAME}'...")
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000
        )
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
        # Ping server to verify connection
        await db_manager.client.admin.command("ping")
        logger.info(f"[OK] Successfully connected to MongoDB Atlas database: '{settings.MONGODB_DB_NAME}'")
    except Exception as e:
        logger.error(f"[FAIL] Failed to connect to MongoDB: {e}")
        pass


async def close_mongo_connection():
    """Close async MongoDB connection pool."""
    if db_manager.client:
        logger.info("Closing MongoDB connection pool...")
        db_manager.client.close()
        logger.info("MongoDB connection pool closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Dependency getter for FastAPI endpoints."""
    return db_manager.db
