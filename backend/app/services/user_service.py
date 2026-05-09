import bcrypt
from sqlalchemy.orm import Session
from app.db.models import User


def get_user(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, password: str) -> User:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(username=username, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
