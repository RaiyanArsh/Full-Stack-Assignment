from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
import fitz  # PyMuPDF
import httpx  # Use httpx for async requests
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a class for the request body
class Message(BaseModel):
    role: str
    content: str

# Groq API URL and headers
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# GROQ_API_KEY = "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"  # Replace with your Groq API Key
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GROQ_API_KEY}",
}

# Function to extract text from PDF
def extract_pdf_text(file: UploadFile):
    # Read the file data directly from the UploadFile object
    pdf_document = fitz.open(stream=file.file.read(), filetype="pdf")
    pdf_text = ""
    
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        pdf_text += page.get_text("text")
    
    return pdf_text

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Extract text from the uploaded PDF
        pdf_text = extract_pdf_text(file)
        
        # Send the PDF content to the Groq API for processing
        response = await query_groq_api(pdf_text)
        
        # Return the response from the Groq API
        return {"pdf_text": pdf_text, "groq_response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {e}")

# Function to query the Groq API with PDF content
async def query_groq_api(pdf_content: str):
    async with httpx.AsyncClient() as client:
        try:
            # Prepare the message for the Groq API
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Here is some text from a PDF: {pdf_content}. Please summarize the key points."}
            ]
            
            # Prepare the data to send to the Groq API
            payload = {
                "model": "llama3-8b-8192",  # Use the appropriate model
                "messages": messages,
            }

            # Make the API call to Groq API
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            response.raise_for_status()  # Raise an error for bad responses

            # Return the response from the Groq API
            return response.json()

        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"API request failed: {e}")

@app.post("/chat-completion/")
async def chat_completion(messages: list[Message]):
    async with httpx.AsyncClient() as client:
        try:
            # Prepare the data to send to the Groq API
            payload = {
                "model": "llama3-8b-8192",  # Use the appropriate model
                "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            }

            # Make the API call to Groq API
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            response.raise_for_status()  # Raise an error for bad responses

            # Return the response from the Groq API
            return response.json()

        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"API request failed: {e}")
