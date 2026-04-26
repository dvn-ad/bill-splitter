from google import genai
from google.genai import types
from core.config import settings
import json
import httpx

class AIService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_id = 'gemini-2.5-flash-lite'

    async def extract_invoice_data(self, image_url: str) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            image_data = response.content

        prompt = """
        Analyze this invoice image and extract the following information into a structured JSON format:
        {
            "merchant_name": "string",
            "date": "string",
            "items": [
                {"name": "string", "quantity": number, "price": number, "total": number}
            ],
            "subtotal": number,
            "tax": number,
            "service_charge": number,
            "total": number
        }
        Ensure all numbers are floats. If a field is not found, use null or 0.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[
                    prompt,
                    types.Part.from_bytes(data=image_data, mime_type='image/jpeg')
                ]
            )
            
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            print(f"{text}")
            return json.loads(text)
        except Exception as e:
            print(f"Error in extract_invoice_data: {str(e)}")
            raise e

    async def chat_with_invoice(self, invoice_data: dict, user_query: str) -> str:
        prompt = f"""
        You are a helpful bill-splitting assistant. 
        Below is the structured data from an invoice:
        {json.dumps(invoice_data, indent=2)}
        
        The user asks: "{user_query}"
        
        ...
        """
        
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt
        )
        return response.text

ai_service = AIService()
