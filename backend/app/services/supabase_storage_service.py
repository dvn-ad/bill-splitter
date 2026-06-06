import base64
import httpx
import uuid
import mimetypes
from app.core.config import get_settings

def get_default_supabase_url(db_url: str) -> str:
    try:
        if "postgres." in db_url:
            part = db_url.split("postgres.")[1]
            project_id = part.split(":")[0]
            return f"https://{project_id}.supabase.co"
    except Exception:
        pass
    return ""

async def upload_image_base64(image_base64: str, media_type: str) -> str | None:
    settings = get_settings()
    supabase_url = settings.SUPABASE_URL or get_default_supabase_url(settings.DATABASE_URL)
    supabase_key = settings.SUPABASE_KEY
    
    if not supabase_url or not supabase_key:
        print("Supabase URL or Key is not configured. Skipping image upload.")
        return None
        
    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as e:
        print(f"Failed to decode base64 image: {e}")
        return None
        
    # Generate unique filename
    ext = mimetypes.guess_extension(media_type) or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    bucket_name = "receipts"
    
    # Supabase Storage Upload API
    upload_url = f"{supabase_url}/storage/v1/object/{bucket_name}/{filename}"
    
    headers = {
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": media_type,
    }
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(upload_url, content=image_bytes, headers=headers)
            if res.status_code == 200:
                public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{filename}"
                return public_url
            else:
                print(f"Failed to upload receipt to Supabase Storage: {res.status_code} - {res.text}")
        except Exception as e:
            print(f"Exception during Supabase Storage upload: {e}")
            
    return None
