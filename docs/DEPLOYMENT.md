# Deployment Guide

ExploreMe AI is designed to be easily deployed to modern cloud PaaS providers. This guide outlines deployment using Vercel (Frontend) and Render (Backend).

## 1. Backend Deployment (Render.com)

We recommend deploying the FastAPI backend as a Web Service on Render.

1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. Set the following build settings:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Define the following Environment Variables in the Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for signing tokens.
   - `GROQ_API_KEY`: Your Groq LLM API key.
   - `CLOUDINARY_URL`: Your Cloudinary connection string.
   - `ALLOWED_ORIGINS`: `https://your-vercel-frontend.vercel.app`

## 2. Frontend Deployment (Vercel)

Vercel is the recommended host for the Vite React frontend.

1. Import your GitHub repository into Vercel.
2. Ensure the framework preset is set to **Vite**.
3. Set the root directory to `frontend`.
4. Define the following Environment Variables:
   - `VITE_API_URL`: The URL of your Render backend (e.g., `https://exploreme-api.onrender.com/api/v1`)
5. Click **Deploy**.

## 3. Custom Domain Configuration (Portfolios)

If users wish to connect custom domains to their AI Portfolios:
- You will need to configure Vercel's Domains API to programmatically attach subdomains and custom domains to your Vercel project. 
- Ensure wildcard DNS (`*.exploreme.ai`) is pointing to your Vercel CNAME record.
