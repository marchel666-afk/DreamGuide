from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    username: Optional[str]
    first_name: str
    streak_days: int
    total_stars: int
    is_premium: bool
    free_interpretations_today: int

    class Config:
        from_attributes = True


class DreamCreate(BaseModel):
    text: str
    emotion: str  # fear/joy/sadness/surprise


class InterpretationCreate(BaseModel):
    type: str  # psychological/everyday/creative


class InterpretationOut(BaseModel):
    id: int
    dream_id: int
    type: str
    content: str
    is_premium: bool
    created_at: datetime

    class Config:
        from_attributes = True


class DreamOut(BaseModel):
    id: int
    user_id: int
    text: str
    emotion: str
    created_at: datetime
    is_public: bool
    interpretations: list[InterpretationOut] = []

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_dreams: int
    streak_days: int
    total_stars: int
    emotions: dict[str, int]
    recent_dreams: list[DreamOut] = []


class CalendarOut(BaseModel):
    data: dict[str, int]


class GalleryDreamOut(BaseModel):
    id: int
    text: str
    emotion: str
    created_at: datetime
    author_initials: str
    interpretation_preview: Optional[str] = None


class PricesOut(BaseModel):
    prices: dict[str, int]
