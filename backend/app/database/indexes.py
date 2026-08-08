from app.database.mongodb import db_manager
from app.core.logging import logger


async def create_database_indexes():
    """Ensure MongoDB compound indexes are initialized for all query paths."""
    if db_manager.db is None:
        return

    try:
        # Users Collection Indexes
        await db_manager.db["users"].create_index("email", unique=True)

        # Resumes Collection Indexes
        await db_manager.db["resumes"].create_index([("user_id", 1), ("updated_at", -1)])

        # Portfolios Collection Indexes
        await db_manager.db["portfolios"].create_index("user_id")
        await db_manager.db["portfolios"].create_index("slug", unique=True, sparse=True)
        await db_manager.db["portfolios"].create_index("is_published")

        # Portfolio Analytics Indexes
        await db_manager.db["portfolio_analytics"].create_index([("portfolio_id", 1), ("timestamp", -1)])
        
        # Phase 7 New Collections Indexes
        await db_manager.db["brand_profiles"].create_index("user_id", unique=True)
        await db_manager.db["portfolio_versions"].create_index([("portfolio_id", 1), ("user_id", 1)])
        await db_manager.db["portfolio_posts"].create_index([("user_id", 1), ("created_at", -1)])
        await db_manager.db["portfolio_analytics_v2"].create_index([("portfolio_id", 1), ("date", -1)])
        await db_manager.db["seo_profiles"].create_index("portfolio_id", unique=True)
        await db_manager.db["branding_scores"].create_index([("user_id", 1), ("created_at", -1)])

        # Phase 8 New Collections Indexes
        await db_manager.db["companies"].create_index("name")
        await db_manager.db["job_posts"].create_index([("company_id", 1), ("status", 1)])
        await db_manager.db["job_posts"].create_index("title")
        await db_manager.db["hiring_pipeline"].create_index([("job_id", 1), ("candidate_id", 1)], unique=True)
        await db_manager.db["candidate_matches"].create_index([("job_id", 1), ("candidate_id", 1)], unique=True)
        await db_manager.db["messages"].create_index([("sender_id", 1), ("receiver_id", 1), ("created_at", -1)])
        await db_manager.db["interview_schedule"].create_index([("candidate_id", 1), ("job_id", 1)])

        # --- Golden Membership / Payment Indexes ---
        await db_manager.db["payments"].create_index("user_id")
        await db_manager.db["payments"].create_index("razorpay_payment_id", unique=True, sparse=True)
        await db_manager.db["payments"].create_index("razorpay_subscription_id", sparse=True)
        await db_manager.db["daily_ai_credits"].create_index([("user_id", 1), ("date", 1)], unique=True)
        await db_manager.db["razorpay_settings"].create_index("key", unique=True)
        await db_manager.db["users"].create_index("razorpay_subscription_id", sparse=True)

        logger.info("[OK] MongoDB compound indexes created successfully.")
    except Exception as e:
        logger.warning(f"MongoDB index creation warning: {e}")
