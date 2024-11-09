# Backend - FastAPI

This is the backend part of the Full-Stack Assignment project, built using FastAPI.

## Prerequisites

- Python 3.8 or later
- `pip` package manager
- (Optional) Virtual environment manager like `venv`

## Getting Started

Follow these steps to set up and run the backend server locally:

### 1. Clone the Repository

```bash
git clone https://github.com/RaiyanArsh/Full-Stack-Assignment.git
cd Full-Stack-Assignment/Backend
```

### 2. Set Up a Virtual Environment (Optional but Recommended)

```
# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
venv\Scripts\activate

```

### 3. Install Dependencies

```
pip install -r requirements.txt
```

### 4. Configure Environment Variables

``` 
GROQ_API_KEY=Your Groq API key
```

### 5.  Run the Development Server

``` 
uvicorn main:app --reload
```

### NOTE: The API will be available at http://localhost:8000
API Documentation
Once the server is running, you can access the API documentation:

### Swagger UI: http://localhost:8000/docs
### Redoc: http://localhost:8000/redoc

### Note: Too get your grop api key, refer to below website
- https://console.groq.com/keys
