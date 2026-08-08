from typing import List, Dict, Any, Optional
from bson import ObjectId
from datetime import datetime, timezone
from app.database.mongodb import db_manager
from app.models.hiring import ApplicationModel, CandidateMatchModel, InterviewModel, MessageModel

class CandidateSearchService:
    @staticmethod
    async def search_candidates(filters: dict) -> List[dict]:
        # Search verified public or recruiter_only candidates
        query = {"candidate_visibility": {"$in": ["public", "recruiter_only"]}}
        
        # We would join with resumes/portfolios, but for now we search users directly
        # MVP implementation
        cursor = db_manager.db["users"].find(query).limit(50)
        candidates = []
        async for doc in cursor:
            # Fetch latest resume
            resume = await db_manager.db["resumes"].find_one({"user_id": str(doc["_id"])}, sort=[("updated_at", -1)])
            doc["_id"] = str(doc["_id"])
            if resume:
                doc["resume_summary"] = resume.get("personal_info", {}).get("summary", "")
                doc["skills"] = resume.get("skills", [])
            candidates.append(doc)
            
        return candidates

class CandidateMatchService:
    @staticmethod
    async def evaluate_candidate(job_id: str, candidate_id: str) -> CandidateMatchModel:
        # Mock AI evaluation
        match = CandidateMatchModel(
            job_id=job_id,
            candidate_id=candidate_id,
            match_score=85,
            strengths=["React", "TypeScript", "System Design"],
            weaknesses=["Kubernetes"],
            missing_skills=["AWS Cert"],
            recommendation="Strong candidate for frontend role."
        )
        await db_manager.db["candidate_matches"].insert_one(match.model_dump(by_alias=True))
        return match

class HiringPipelineService:
    @staticmethod
    async def create_application(app_data: dict) -> ApplicationModel:
        app = ApplicationModel(**app_data)
        await db_manager.db["hiring_pipeline"].insert_one(app.model_dump(by_alias=True))
        return app
        
    @staticmethod
    async def update_status(application_id: str, new_status: str) -> Optional[ApplicationModel]:
        res = await db_manager.db["hiring_pipeline"].find_one_and_update(
            {"_id": application_id},
            {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}},
            return_document=True
        )
        if res:
            return ApplicationModel(**res)
        return None

class InterviewSchedulerService:
    @staticmethod
    async def schedule_interview(interview_data: dict) -> InterviewModel:
        interview = InterviewModel(**interview_data)
        await db_manager.db["interview_schedule"].insert_one(interview.model_dump(by_alias=True))
        return interview

class MessagingService:
    @staticmethod
    async def send_message(message_data: dict) -> MessageModel:
        msg = MessageModel(**message_data)
        await db_manager.db["messages"].insert_one(msg.model_dump(by_alias=True))
        return msg
        
    @staticmethod
    async def get_messages(user1_id: str, user2_id: str) -> List[MessageModel]:
        query = {
            "$or": [
                {"sender_id": user1_id, "receiver_id": user2_id},
                {"sender_id": user2_id, "receiver_id": user1_id}
            ]
        }
        cursor = db_manager.db["messages"].find(query).sort("created_at", 1)
        return [MessageModel(**doc) async for doc in cursor]

class AIRecruiterAssistantService:
    @staticmethod
    async def evaluate_candidates(query: str, candidates: List[dict]) -> str:
        # Mock integration with LLM
        return "Based on the comparison, candidate A is stronger in backend architecture, while candidate B has more React experience."
