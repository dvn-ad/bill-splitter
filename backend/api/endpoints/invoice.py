from fastapi import APIRouter, UploadFile, File, HTTPException
from models.invoice import InvoiceResponse
from services.ai_service import ai_service
from services.cloud_service import cloud_service
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/upload", response_model=InvoiceResponse)
async def upload_invoice(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}")
        # 1. Upload to Cloudinary
        try:
            image_url = cloud_service.upload_image(file.file)
            print(f"Uploaded to Cloudinary: {image_url}")
        except Exception as e:
            print(f"Cloudinary Error: {str(e)}")
            raise Exception(f"Cloudinary upload failed: {str(e)}")
        
        # 2. Extract data using Gemini
        try:
            extracted_data = await ai_service.extract_invoice_data(image_url)
            print("Successfully extracted data from Gemini")
        except Exception as e:
            print(f"Gemini Error: {str(e)}")
            raise Exception(f"AI extraction failed: {str(e)}")
        
        # 3. Create response object
        invoice_res = {
            "id": str(uuid.uuid4()),
            "image_url": image_url,
            "data": extracted_data,
            "created_at": datetime.now()
        }
        
        return invoice_res
    except Exception as e:
        print(f"Upload endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
