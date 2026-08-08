from typing import List, Dict, Any, Optional
from bson import ObjectId
from app.database.mongodb import db_manager
from app.models.company import CompanyModel
from app.models.job import JobPostModel

class CompanyService:
    @staticmethod
    async def create_company(company_data: dict) -> CompanyModel:
        company = CompanyModel(**company_data)
        await db_manager.db["companies"].insert_one(company.model_dump(by_alias=True))
        return company
    
    @staticmethod
    async def get_company(company_id: str) -> Optional[CompanyModel]:
        data = await db_manager.db["companies"].find_one({"_id": company_id})
        if data:
            return CompanyModel(**data)
        return None

class JobPostService:
    @staticmethod
    async def create_job_post(job_data: dict) -> JobPostModel:
        job = JobPostModel(**job_data)
        await db_manager.db["job_posts"].insert_one(job.model_dump(by_alias=True))
        return job

    @staticmethod
    async def get_jobs_by_company(company_id: str) -> List[JobPostModel]:
        cursor = db_manager.db["job_posts"].find({"company_id": company_id}).sort("created_at", -1)
        return [JobPostModel(**doc) async for doc in cursor]

    @staticmethod
    async def get_job(job_id: str) -> Optional[JobPostModel]:
        data = await db_manager.db["job_posts"].find_one({"_id": job_id})
        if data:
            return JobPostModel(**data)
        return None
