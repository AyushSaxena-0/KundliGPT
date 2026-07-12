# AI Vedic Astrologer Backend

This is the backend API for the **AI Vedic Astrologer** application. Built with **FastAPI**, **Python 3.12**, and **Google Gemini API**, it provides an intelligent, compassionate, and wise Vedic Astrology chat interface. The system maintains conversation memory, validates user birth details, logs application metrics, and records user feedback in a production-ready and modular structure.

Designed to run smoothly and be ready for one-click deployment on platforms like **Render Free**.

---

## Folder Structure

```text
backend/
├── app/
│   ├── config/          # Configuration loading & validation using Pydantic Settings
│   ├── middleware/      # CORs, timing, tracing request ID, and global error catchers
│   ├── prompts/         # System instructions loaded dynamically
│   ├── routes/          # API endpoint router groups (chat, feedback, base health)
│   ├── schemas/         # Pydantic request/response model definitions & validations
│   ├── services/        # Third-party integrations (Gemini API) & core logic handlers
│   ├── tests/           # Automation test cases (Pytest, Endpoints, and Services)
│   ├── utils/           # Timezone utilities, inputs sanitizers, and formatting helpers
│   └── main.py          # FastAPI application initialization & middleware assembly
├── .env.example         # Template for environment configuration
├── requirements.txt     # Python dependencies
└── README.md            # Project guide documentation
```

---

## Features

- **Compassionate Vedic Persona**: Guided by a robust system prompt that prevents superstition, avoids predictions with absolute certainty, handles negative transits constructively (focusing on meditation, mindfulness, and discipline), and suggests consulting relevant professionals for health, law, and finances.
- **Robust Client Validations**: Uses Pydantic to check for empty inputs, future birthdates, invalid calendars (e.g., Feb 31st), and 24-hour time formatting, returning clean `HTTP 400 Bad Request` messages.
- **Smart Retries & Safety**: Built-in exponential backoff to handle rate limits (`429`) and server drops from the Gemini API.
- **Stateless Session Context**: Integrates historical context and birth information dynamically in each chat payload, removing the need for server-bound state database dependencies.
- **Tracing & Observability**: Latency monitoring with `X-Response-Time` and tracing with `X-Request-ID` attached to responses and request logs.
- **Deployment-Ready Security**: Built-in sanitization to protect against prompt injection, response compression, CORS configurations, and default security headers (`X-Frame-Options`, `Content-Security-Policy`, etc.).

---

## Installation & Setup

### Prerequisites
- Python 3.12+
- A Google Gemini API Key (obtainable from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Navigate
Ensure you are in the `backend` directory:
```bash
cd backend
```

### 2. Create Virtual Environment
Create a clean environment and activate it:

**On Windows:**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
Install all required libraries:
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Copy the configuration template and populate it with your keys:
```bash
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux
```

Open `.env` and fill out your variables:
```ini
GEMINI_API_KEY=AIzaSy...                 # Your Gemini API Key
ALLOWED_ORIGINS=http://localhost:3000   # Commas separated CORS origins
ENVIRONMENT=development                  # development or production
DEBUG=true                              # Show traceback details on API validation
APP_NAME="AI Vedic Astrologer"
BACKEND_URL=http://localhost:8000
```

---

## Running Locally

To spin up the local development server with auto-reload:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API Documentation**: Go to [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger UI.
- **Health Check**: Open [http://localhost:8000/health](http://localhost:8000/health) to confirm uptime status.

---

## API Endpoints

### 1. `GET /`
Returns root application info.
* **Response:**
  ```json
  {
    "appName": "AI Vedic Astrologer",
    "version": "1.0.0",
    "status": "online",
    "health": "excellent",
    "timestamp": "2026-07-11T23:14:03Z"
  }
  ```

### 2. `GET /health`
Returns health check status and uptime statistics.
* **Response:**
  ```json
  {
    "status": "healthy",
    "uptime": "2h 45m 12s",
    "uptimeSeconds": 9912.45,
    "version": "1.0.0",
    "timestamp": "2026-07-11T23:14:03Z"
  }
  ```

### 3. `POST /api/chat`
Sends a message to the AI Astrologer.
* **Request Body:**
  ```json
  {
    "message": "What is my career prospects?",
    "conversationId": "d3b07384-d113-4956-a5db-e8c14c5b6b1a",
    "birthDetails": {
      "name": "Amit Patel",
      "gender": "Male",
      "date_of_birth": "1992-04-18",
      "time_of_birth": "18:30",
      "place_of_birth": "Mumbai, India",
      "timezone": "Asia/Kolkata"
    },
    "history": [
      {
        "role": "user",
        "content": "Hello Astrologer"
      },
      {
        "role": "model",
        "content": "Hello Amit, I am here to guide you."
      }
    ]
  }
  ```
* **Response:**
  ```json
  {
    "reply": "Based on the planetary alignments on April 18, 1992, you are currently under the influence...",
    "timestamp": "2026-07-11T23:14:05Z"
  }
  ```

### 4. `POST /api/reset`
Creates a brand new conversation session ID.
* **Response:**
  ```json
  {
    "conversationId": "7df4a938-12bc-45f8-b3d9-4a92c4f5a3b9"
  }
  ```

### 5. `POST /api/feedback`
Submits session feedback (stored in `feedback.json`).
* **Request Body:**
  ```json
  {
    "rating": 5,
    "comment": "Incredible reading, highly accurate guidelines!",
    "conversationId": "d3b07384-d113-4956-a5db-e8c14c5b6b1a"
  }
  ```
* **Response:**
  ```json
  {
    "status": "success",
    "message": "Thank you! Your feedback has been stored successfully."
  }
  ```

---

## Testing

Automated tests are located in `app/tests`. We use Pytest with asyncio mock support.

Run all tests:
```bash
pytest -v
```

To run with coverage:
```bash
pytest --cov=app -v
```

---

## Deploying to Render Free

Render makes it easy to deploy FastAPI backends. Follow these steps:

1. **GitHub Repository**: Push this code structure to your GitHub repository (ensure `.env` is omitted and ignored).
2. **Create Web Service**:
   - In your Render dashboard, click **New +** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure Service**:
   - **Name**: `ai-vedic-astrologer-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt` (or if your code is nested: `pip install -r backend/requirements.txt`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000` (or `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`)
4. **Environment Variables**:
   Under the **Environment** tab on Render, add:
   - `GEMINI_API_KEY`: *(Your key from Google AI Studio)*
   - `ALLOWED_ORIGINS`: `*` *(or your frontend URL deployed on Vercel/Netlify)*
   - `ENVIRONMENT`: `production`
   - `DEBUG`: `false`
   - `APP_NAME`: `AI Vedic Astrologer`
   - `BACKEND_URL`: *(Leave blank or fill with Render URL after setup)*
5. **Deploy**: Render will automatically build the container and spin it up. The service will be live on a `*.onrender.com` URL.

---

## Common Issues & Troubleshooting

### 1. `CRITICAL CONFIGURATION ERROR: GEMINI_API_KEY cannot be empty`
* **Cause**: FastAPI failed to find your environment variables.
* **Fix**: Ensure your `.env` file exists inside the same directory from where you are executing `uvicorn`. Ensure there are no spaces around the keys in the `.env` file.

### 2. `HTTP 400 Bad Request` with type `ValidationError`
* **Cause**: The client sent birth details or history that broke validation rules (e.g., date formatted as `18-04-1992` instead of `1992-04-18`, time is `6:30 PM` instead of `18:30`, or history list was too long).
* **Fix**: Ensure the client-side inputs match `YYYY-MM-DD` and `HH:MM` in 24-hour formats.

### 3. Extremely slow responses when deploying on Render Free
* **Cause**: Under Render's free tier, the instance will spin down after 15 minutes of inactivity. The first request after spin-down can take 50+ seconds to boot up.
* **Fix**: Use a cron monitor or ping service (like UptimeRobot) to ping `/health` every 14 minutes to keep the backend warm, or upgrade to Render's paid starter tier.
