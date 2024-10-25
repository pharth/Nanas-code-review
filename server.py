from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for all origins (or specify the origins if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing; specify domains in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Global variables to store the latest extracted question, answer, and program type
latest_extracted_question = ""
latest_extracted_answer = ""
latest_extracted_program_type = ""

class ExtractedData(BaseModel):
    question: str
    answer: str
    program_type: str

@app.post("/receive_text")
async def receive_text(data: ExtractedData):
    global latest_extracted_question, latest_extracted_answer, latest_extracted_program_type  # Access the global variables
    latest_extracted_question = data.question  # Store the extracted question
    latest_extracted_answer = data.answer  # Store the extracted answer
    latest_extracted_program_type = data.program_type  # Store the extracted program type
    print("Received question:", latest_extracted_question)
    print("Received answer:", latest_extracted_answer)
    print("Received program type:", latest_extracted_program_type)
    
    # Return a JSON response with the received question, answer, and program type
    return {
        "status": "success",
        "message": "Text received successfully",
        "received_question": latest_extracted_question,
        "received_answer": latest_extracted_answer,
        "received_program_type": latest_extracted_program_type
    }

@app.get("/get_latest_text")
async def get_latest_text():
    # Endpoint to retrieve the latest extracted question, answer, and program type
    return {
        "status": "success",
        "question": latest_extracted_question,
        "answer": latest_extracted_answer,
        "program_type": latest_extracted_program_type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
