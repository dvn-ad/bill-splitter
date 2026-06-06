from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    saved_invoices = relationship("SavedInvoice", back_populates="user", cascade="all, delete-orphan")


class SavedInvoice(Base):
    __tablename__ = "saved_invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    invoice_data = Column(JSON, nullable=False)
    chat_history = Column(JSON, nullable=False)
    split_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_invoices")

