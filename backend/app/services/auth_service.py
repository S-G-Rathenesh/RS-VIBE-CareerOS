import uuid
from datetime import datetime, timedelta, timezone
from app.database.mongodb import db_manager
from app.models.user import UserModel
from app.schemas.auth import UserRegister, UserLogin, TokenResponse
from app.security.password import hash_password, verify_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token
from app.core.exceptions import ConflictException, UnauthorizedException, NotFoundException


class AuthService:
    @staticmethod
    async def register(data: UserRegister) -> dict:
        if db_manager.db is None:
            # InMemory fallback mock object for offline dev mode
            user_dict = {
                "_id": str(uuid.uuid4()),
                "email": data.email,
                "full_name": data.full_name,
                "role": "user",
                "is_email_verified": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            access_token = create_access_token({"sub": user_dict["_id"], "email": user_dict["email"]})
            refresh_token = create_refresh_token({"sub": user_dict["_id"], "email": user_dict["email"]})
            user_dict["id"] = user_dict["_id"]
            return {"user": user_dict, "tokens": TokenResponse(access_token=access_token, refresh_token=refresh_token)}

        existing_user = await db_manager.db["users"].find_one({"email": data.email.lower()})
        if existing_user:
            raise ConflictException(message="An account with this email already exists.", code="EMAIL_ALREADY_REGISTERED")

        user_obj = UserModel(
            email=data.email.lower(),
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role="user",
            is_email_verified=False,
            auth_providers=["local"]
        )

        user_dict = user_obj.model_dump(by_alias=True)
        await db_manager.db["users"].insert_one(user_dict)

        # Generate OTP
        await AuthService._generate_and_send_otp(user_dict["email"])

        user_dict["id"] = str(user_dict["_id"])
        # Strip sensitive fields before returning to client
        for key in ("hashed_password", "refresh_tokens", "_id"):
            user_dict.pop(key, None)
        return {
            "user": user_dict,
            "message": "Registration successful. Please verify your email."
        }

    @staticmethod
    async def login(data: UserLogin) -> dict:
        if db_manager.db is None:
            user_dict = {
                "_id": "demo_user_id",
                "email": data.email,
                "full_name": "Demo User",
                "role": "user",
                "is_email_verified": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            access_token = create_access_token({"sub": user_dict["_id"], "email": user_dict["email"]})
            refresh_token = create_refresh_token({"sub": user_dict["_id"], "email": user_dict["email"]})
            user_dict["id"] = user_dict["_id"]
            return {"user": user_dict, "tokens": TokenResponse(access_token=access_token, refresh_token=refresh_token)}

        user = await db_manager.db["users"].find_one({"email": data.email.lower()})
        if not user:
            raise UnauthorizedException(message="No account is registered with this email.", code="EMAIL_NOT_REGISTERED")
            
        if not verify_password(data.password, user["hashed_password"]):
            raise UnauthorizedException(message="Incorrect email or password.", code="INVALID_CREDENTIALS")
            
        if not user.get("is_email_verified", False):
            # Tell frontend they need to verify
            raise UnauthorizedException(message="Please verify your email to continue.", code="EMAIL_UNVERIFIED")

        access_token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
        refresh_token = create_refresh_token({"sub": str(user["_id"]), "email": user["email"]})

        await db_manager.db["users"].update_one(
            {"_id": user["_id"]},
            {"$push": {"refresh_tokens": refresh_token}}
        )

        user["id"] = str(user["_id"])
        # Strip sensitive fields before returning to client
        for key in ("hashed_password", "refresh_tokens", "_id"):
            user.pop(key, None)
        return {
            "user": user,
            "tokens": TokenResponse(access_token=access_token, refresh_token=refresh_token)
        }

    @staticmethod
    async def refresh(refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException(message="Invalid token type")

        user_id = payload.get("sub")
        if db_manager.db is not None:
            user = await db_manager.db["users"].find_one({"_id": user_id})
            if not user or refresh_token not in user.get("refresh_tokens", []):
                raise UnauthorizedException(message="Refresh token revoked or invalid")

        new_access_token = create_access_token({"sub": user_id, "email": payload.get("email")})
        new_refresh_token = create_refresh_token({"sub": user_id, "email": payload.get("email")})

        if db_manager.db is not None:
            await db_manager.db["users"].update_one(
                {"_id": user_id},
                {"$pull": {"refresh_tokens": refresh_token}, "$push": {"refresh_tokens": new_refresh_token}}
            )

        return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)

    @staticmethod
    async def forgot_password(email: str) -> None:
        import secrets
        import hashlib
        from app.providers.email import email_provider

        # 1. Generate secure random raw token
        raw_token = secrets.token_urlsafe(32)
        # 2. Hash it for DB storage
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        if db_manager.db is not None:
            user = await db_manager.db["users"].find_one({"email": email.lower()})
            if user:
                await db_manager.db["users"].update_one(
                    {"_id": user["_id"]},
                    {"$set": {"reset_token_hash": token_hash, "reset_token_expires": expires}}
                )
                # Send email (or log if in dev mode)
                email_provider.send_password_reset_email(user["email"], raw_token)
        # We do NOT return the token!
        return None

    @staticmethod
    async def reset_password(raw_token: str, new_password: str) -> bool:
        import hashlib
        
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        
        if db_manager.db is not None:
            user = await db_manager.db["users"].find_one({
                "reset_token_hash": token_hash,
                "reset_token_expires": {"$gt": datetime.now(timezone.utc)}
            })
            if not user:
                raise UnauthorizedException(message="Invalid or expired password reset token.")

            hashed = hash_password(new_password)
            await db_manager.db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": {"hashed_password": hashed}, "$unset": {"reset_token_hash": "", "reset_token_expires": "", "reset_token": ""}}
            )
        return True

    @staticmethod
    async def _generate_and_send_otp(email: str):
        import random, hashlib
        from datetime import datetime, timedelta, timezone
        from app.providers.email import email_provider

        otp = f"{random.randint(0, 999999):06d}"
        otp_hash = hashlib.sha256(otp.encode("utf-8")).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        if db_manager.db is not None:
            await db_manager.db["email_verifications"].update_one(
                {"email": email.lower()},
                {"$set": {
                    "otp_hash": otp_hash,
                    "expires_at": expires_at,
                    "attempts": 0,
                    "updated_at": datetime.now(timezone.utc)
                }},
                upsert=True
            )
            email_provider.send_email_verification_otp(email, otp)

    @staticmethod
    async def verify_email(email: str, otp: str) -> dict:
        import hashlib
        from datetime import datetime, timezone
        
        email = email.lower()
        if db_manager.db is None:
            raise UnauthorizedException(message="Database offline.")

        verification = await db_manager.db["email_verifications"].find_one({"email": email})
        if not verification:
            raise UnauthorizedException(message="No pending verification found.")
            
        if verification.get("expires_at") < datetime.now(timezone.utc):
            raise UnauthorizedException(message="Verification code expired.")
            
        if verification.get("attempts", 0) >= 5:
            raise UnauthorizedException(message="Too many failed attempts. Please request a new code.")
            
        otp_hash = hashlib.sha256(otp.encode("utf-8")).hexdigest()
        if otp_hash != verification.get("otp_hash"):
            await db_manager.db["email_verifications"].update_one(
                {"_id": verification["_id"]},
                {"$inc": {"attempts": 1}}
            )
            raise UnauthorizedException(message="Invalid verification code.")
            
        # Success!
        await db_manager.db["email_verifications"].delete_one({"_id": verification["_id"]})
        
        user = await db_manager.db["users"].find_one({"email": email})
        if not user:
            raise NotFoundException(message="User not found.")
            
        await db_manager.db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"is_email_verified": True}}
        )
        
        access_token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
        refresh_token = create_refresh_token({"sub": str(user["_id"]), "email": user["email"]})

        await db_manager.db["users"].update_one(
            {"_id": user["_id"]},
            {"$push": {"refresh_tokens": refresh_token}}
        )

        user["id"] = str(user["_id"])
        user["is_email_verified"] = True
        for key in ("hashed_password", "refresh_tokens", "_id"):
            user.pop(key, None)
        return {
            "user": user,
            "tokens": TokenResponse(access_token=access_token, refresh_token=refresh_token)
        }

    @staticmethod
    async def resend_verification(email: str) -> None:
        from datetime import datetime, timezone
        email = email.lower()
        if db_manager.db is None:
            return

        user = await db_manager.db["users"].find_one({"email": email})
        if not user:
            return # Don't leak user existence
            
        if user.get("is_email_verified"):
            raise ConflictException(message="Email is already verified.")
            
        verification = await db_manager.db["email_verifications"].find_one({"email": email})
        if verification:
            updated_at = verification.get("updated_at")
            if updated_at:
                # Ensure updated_at is timezone-aware to match datetime.now(timezone.utc)
                if updated_at.tzinfo is None:
                    updated_at = updated_at.replace(tzinfo=timezone.utc)
                diff = (datetime.now(timezone.utc) - updated_at).total_seconds()
                if diff < 60:
                    raise ConflictException(message=f"Please wait {int(60 - diff)} seconds before requesting a new code.")
                    
        await AuthService._generate_and_send_otp(email)

    @staticmethod
    async def google_auth(token: str) -> dict:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        from google.auth import jwt
        from app.core.config import settings
        import uuid
        from app.core.logging import logger
        
        try:
            # Diagnostics: Token info
            logger.info(f"Received Google Token: present={bool(token)}, length={len(token)}, segments={len(token.split('.'))}")
            
            # Diagnostics: JWT Payload without verification
            try:
                unverified_payload = jwt.decode(token, verify=False)
                logger.info(f"JWT Payload Diagnostic: aud={unverified_payload.get('aud')}, iss={unverified_payload.get('iss')}, email={unverified_payload.get('email')}, exp={unverified_payload.get('exp')}, azp={unverified_payload.get('azp')}")
            except Exception as e:
                logger.warning(f"Could not decode JWT for diagnostics: {type(e).__name__}: {str(e)}")
            
            # Diagnostics: Client ID info
            google_id = settings.GOOGLE_CLIENT_ID
            if google_id and len(google_id) > 6:
                logger.info(f"Configured GOOGLE_CLIENT_ID: length={len(google_id)}, ends with={google_id[-6:]}")
            else:
                logger.info(f"Configured GOOGLE_CLIENT_ID: length={len(google_id) if google_id else 0}")
                
            # Verify token
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
            
            # ID token is valid. Extract the user's Google info.
            google_sub = idinfo['sub']
            email = idinfo['email'].lower()
            name = idinfo.get('name', 'Google User')
            picture = idinfo.get('picture')
            
        except ValueError as e:
            # Catch specific verification exceptions
            logger.error(f"Google OAuth Verification Failed [ValueError]: {str(e)}")
            raise UnauthorizedException(message="Invalid Google token.")
        except Exception as e:
            logger.error(f"Google OAuth Unexpected Error [{type(e).__name__}]: {str(e)}")
            raise UnauthorizedException(message="Invalid Google token.")
            
        if db_manager.db is None:
            raise UnauthorizedException(message="Database offline.")
            
        user = await db_manager.db["users"].find_one({"email": email})
        if user:
            # Link account
            update_data = {}
            if "google" not in user.get("auth_providers", ["local"]):
                providers = user.get("auth_providers", ["local"])
                providers.append("google")
                update_data["auth_providers"] = providers
            
            if not user.get("google_sub"):
                update_data["google_sub"] = google_sub
                
            if not user.get("is_email_verified"):
                update_data["is_email_verified"] = True
                
            if update_data:
                await db_manager.db["users"].update_one(
                    {"_id": user["_id"]},
                    {"$set": update_data}
                )
                user.update(update_data)
        else:
            # Create account
            user_obj = UserModel(
                email=email,
                full_name=name,
                hashed_password=str(uuid.uuid4()), # Dummy password, they use Google
                avatar_url=picture,
                role="user",
                is_email_verified=True,
                auth_providers=["google"],
                google_sub=google_sub
            )
            user = user_obj.model_dump(by_alias=True)
            await db_manager.db["users"].insert_one(user)
            
        access_token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
        refresh_token = create_refresh_token({"sub": str(user["_id"]), "email": user["email"]})

        await db_manager.db["users"].update_one(
            {"_id": user["_id"]},
            {"$push": {"refresh_tokens": refresh_token}}
        )

        user["id"] = str(user["_id"])
        for key in ("hashed_password", "refresh_tokens", "_id"):
            user.pop(key, None)
        return {
            "user": user,
            "tokens": TokenResponse(access_token=access_token, refresh_token=refresh_token)
        }
