from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.core.config import get_settings

app = FastAPI(title="Bill Splitter API")

_settings = get_settings()
_origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if _settings.FRONTEND_URL:
    _origins.append(_settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def on_startup():
    from app.db.base import Base, engine
    from app.db import models  # noqa: F401 — registers ORM models with Base
    Base.metadata.create_all(bind=engine)
