from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated, Any
from .database import init_db, get_db
from .routes import people, classes
from .auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.exceptions import RequestValidationError
from datetime import timedelta

app = FastAPI(title="KanataMusicAcademy API")

# Initialize Database
init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(people.router)
app.include_router(classes.router)

@app.post("/token")
async def login_for_access_token(
    db: Any = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
async def root():
    return {"message": "Welcome to KanataMusicAcademy API"}
