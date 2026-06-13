from datetime import datetime
from sqlalchemy import BigInteger, Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)  # Telegram user ID
    username = Column(String, nullable=True)
    first_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    streak_days = Column(Integer, default=0)
    last_dream_date = Column(Date, nullable=True)
    total_stars = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    premium_until = Column(DateTime, nullable=True)
    free_interpretations_today = Column(Integer, default=0)
    last_interpretation_date = Column(Date, nullable=True)

    dreams = relationship("Dream", back_populates="user")
    payments = relationship("Payment", back_populates="user")


class Dream(Base):
    __tablename__ = "dreams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    text = Column(Text)
    emotion = Column(String)  # fear/joy/sadness/surprise
    created_at = Column(DateTime, default=datetime.utcnow)
    is_public = Column(Boolean, default=False)

    user = relationship("User", back_populates="dreams")
    interpretations = relationship("Interpretation", back_populates="dream")


class Interpretation(Base):
    __tablename__ = "interpretations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dream_id = Column(Integer, ForeignKey("dreams.id"))
    type = Column(String)  # psychological/everyday/creative
    content = Column(Text)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    dream = relationship("Dream", back_populates="interpretations")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    provider = Column(String)  # stars/yookassa
    amount = Column(Integer)
    payload = Column(String)
    status = Column(String)  # pending/success/failed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="payments")
