import io
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import APIException


def mask_secret(val: str) -> str:
    if not val:
        return "<EMPTY>"
    if len(val) <= 8:
        return "****"
    return f"{val[:4]}****{val[-4:]}"


class StorageProvider:
    """
    Production Cloudinary Media Storage Provider featuring official Cloudinary SDK upload(),
    responsive WebP transformations, 2MB avatar size caps, MIME type validation (JPG, PNG, WEBP),
    and automatic orphaned image cleanup.
    """
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024  # 2MB Limit
    MAX_GENERAL_SIZE_BYTES = 5 * 1024 * 1024  # 5MB Limit

    FOLDERS = {
        "avatar": "exploreme_ai/avatars",
        "project": "exploreme_ai/projects",
        "certificate": "exploreme_ai/certificates",
        "resume": "exploreme_ai/resume-images",
        "portfolio": "exploreme_ai/portfolio-images"
    }

    def __init__(self):
        if settings.CLOUDINARY_CLOUD_NAME:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True
            )
            masked_key = mask_secret(settings.CLOUDINARY_API_KEY)
            preset = settings.CLOUDINARY_UPLOAD_PRESET or "None"
            logger.info(
                f"[Cloudinary Configured] cloud_name='{settings.CLOUDINARY_CLOUD_NAME}', "
                f"api_key='{masked_key}', upload_method='cloudinary.uploader.upload()', "
                f"upload_preset='{preset}'"
            )

    def validate_image_file(self, content_type: str, file_size: int, category: str = "avatar"):
        """Validate MIME type and file size limits strictly."""
        ct = (content_type or "").lower()
        if ct not in StorageProvider.ALLOWED_MIME_TYPES:
            raise APIException(
                status_code=400,
                message=f"Invalid format '{content_type}'. Only JPG, PNG, and WEBP images are supported."
            )

        max_limit = StorageProvider.MAX_AVATAR_SIZE_BYTES if category == "avatar" else StorageProvider.MAX_GENERAL_SIZE_BYTES
        if file_size > max_limit:
            raise APIException(
                status_code=400,
                message="Image size must be 2 MB or less. Please choose a smaller image."
            )

    async def upload_image(
        self,
        file_bytes: bytes,
        category: str = "avatar",
        public_id: Optional[str] = None,
        content_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """
        Upload image binary to Cloudinary in dedicated folder using official cloudinary.uploader.upload().
        Returns secure_url and public_id for storage in MongoDB.
        """
        self.validate_image_file(content_type, len(file_bytes), category=category)
        folder = StorageProvider.FOLDERS.get(category, StorageProvider.FOLDERS["avatar"])

        masked_key = mask_secret(settings.CLOUDINARY_API_KEY)
        preset = settings.CLOUDINARY_UPLOAD_PRESET or "None"
        logger.info(
            f"[Cloudinary Upload Attempt] cloud_name='{settings.CLOUDINARY_CLOUD_NAME}', "
            f"api_key='{masked_key}', upload_method='cloudinary.uploader.upload()', "
            f"upload_preset='{preset}', folder='{folder}', bytes={len(file_bytes)}"
        )

        # Cloudinary API Upload via official SDK uploader.upload()
        try:
            transformation = [
                {
                    "quality": "auto",
                    "fetch_format": "auto"
                }
            ]
            if category == "avatar":
                transformation.insert(0, {
                    "width": 400,
                    "height": 400,
                    "crop": "fill",
                    "gravity": "face"
                })

            upload_options = {
                "folder": folder,
                "resource_type": "image",
                "transformation": transformation
            }

            if settings.CLOUDINARY_UPLOAD_PRESET:
                upload_options["upload_preset"] = settings.CLOUDINARY_UPLOAD_PRESET

            if public_id:
                upload_options["public_id"] = public_id
                upload_options["overwrite"] = True

            # Stream BytesIO payload through cloudinary.uploader.upload()
            file_stream = io.BytesIO(file_bytes)
            res = cloudinary.uploader.upload(file_stream, **upload_options)

            secure_url = res.get("secure_url") or ""
            res_public_id = res.get("public_id") or ""

            logger.info(
                f"[Cloudinary Upload Succeeded] public_id='{res_public_id}', url='{secure_url}'"
            )

            return {
                "url": secure_url,
                "public_id": res_public_id,
                "thumbnail_url": secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill,g_face/") if secure_url else secure_url
            }
        except APIException:
            raise
        except Exception as e:
            err_msg = str(e)
            logger.error(
                f"[Cloudinary Upload Failed] Failing API: cloudinary.uploader.upload() | "
                f"cloud_name='{settings.CLOUDINARY_CLOUD_NAME}' | api_key='{masked_key}' | Error: {err_msg}"
            )
            raise APIException(
                status_code=500,
                message=f"Cloudinary upload failed: {err_msg}"
            )

    async def delete_image(self, public_id: str) -> bool:
        """Delete image from Cloudinary using avatar_public_id via cloudinary.uploader.destroy()."""
        try:
            if public_id and not public_id.startswith("local_"):
                logger.info(f"[Cloudinary Delete Attempt] public_id='{public_id}' via cloudinary.uploader.destroy()")
                cloudinary.uploader.destroy(public_id)
            return True
        except Exception as e:
            logger.error(f"[Cloudinary Delete Exception] Failing API: cloudinary.uploader.destroy() | Error: {e}")
            return False

    def test_cloudinary_connection(self) -> Dict[str, Any]:
        """Perform a minimal upload test on startup to verify Cloudinary write permissions."""
        if not settings.CLOUDINARY_CLOUD_NAME:
            return {"status": "unconfigured", "message": "CLOUDINARY_CLOUD_NAME not set"}

        masked_key = mask_secret(settings.CLOUDINARY_API_KEY)
        preset = settings.CLOUDINARY_UPLOAD_PRESET or "None"
        test_pixel = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"

        logger.info(
            f"[Cloudinary Startup Audit] Testing connection: cloud_name='{settings.CLOUDINARY_CLOUD_NAME}', "
            f"api_key='{masked_key}', upload_method='cloudinary.uploader.upload()', upload_preset='{preset}'"
        )
        try:
            file_stream = io.BytesIO(test_pixel)
            upload_opts = {"folder": "exploreme_ai/test"}
            if settings.CLOUDINARY_UPLOAD_PRESET:
                upload_opts["upload_preset"] = settings.CLOUDINARY_UPLOAD_PRESET

            res = cloudinary.uploader.upload(file_stream, **upload_opts)
            pub_id = res.get("public_id")
            if pub_id:
                cloudinary.uploader.destroy(pub_id)

            logger.info("[Cloudinary Startup Audit] SUCCESS: Upload permission test passed!")
            return {"status": "success", "message": "Cloudinary upload test passed", "public_id": pub_id}
        except Exception as e:
            err_str = str(e)
            logger.error(
                f"[Cloudinary Startup Audit] FAILED: Failing API: 'cloudinary.uploader.upload()' | "
                f"cloud_name='{settings.CLOUDINARY_CLOUD_NAME}' | api_key='{masked_key}' | Error: {err_str}"
            )
            return {"status": "failed", "error": err_str, "failing_api": "cloudinary.uploader.upload()"}


_storage_provider_instance = None


def get_storage_provider() -> StorageProvider:
    global _storage_provider_instance
    if _storage_provider_instance is None:
        _storage_provider_instance = StorageProvider()
    return _storage_provider_instance


storage_provider = get_storage_provider()


async def upload_image(file_bytes: bytes, category: str = "avatar", public_id: Optional[str] = None, content_type: str = "image/jpeg") -> Dict[str, Any]:
    return await storage_provider.upload_image(file_bytes, category, public_id, content_type)


async def delete_image(public_id: str) -> bool:
    return await storage_provider.delete_image(public_id)
