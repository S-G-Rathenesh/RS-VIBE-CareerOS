from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class VersionSnapshot(BaseModel):
    version_id: str
    timestamp: datetime
    title: str


class DiffItem(BaseModel):
    change_type: str  # "ADDED" | "REMOVED" | "MODIFIED"
    section: str
    content: str
    previous_content: Optional[str] = None


class VersionDiffResponse(BaseModel):
    current_version_id: str
    compared_version_id: str
    diff_summary: str
    diffs: List[DiffItem] = []
