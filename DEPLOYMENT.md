# Deployment Guide for Inkvero

This guide outlines the steps to deploy the **Inkvero** application.
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas (Already configured)

---

## 0. MongoDB Atlas Configuration (CRUCIAL!)

Before deploying, you **must** allow Render to access your database. Render uses dynamic IP addresses, so you need to allow access from anywhere.

1.  Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2.  Go to **Network Access** in the left sidebar.
3.  Click **+ Add IP Address**.
4.  Select **Allow Access from Anywhere** (0.0.0.0/0).
5.  Click **Confirm**.

> **Note:** If you don't do this, your Render deployment will fail with a connection error.

---

## 1. Backend Deployment (Render)

1.  **Push Code to GitHub**: Ensure your latest code is pushed to your GitHub repository.
2.  **Create Web Service on Render**:
    -   Log in to [Render](https://render.com/).
    -   Click **New +** -> **Web Service**.
    -   Connect your GitHub repository (`Inkvero`).
3.  **Configure Service**:
    -   **Name**: `inkvero-api` (or similar)
    -   **Root Directory**: `server`
    -   **Environment**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
4.  **Environment Variables**:
    -   Add the following variables in the **Environment** tab:
        -   `NODE_ENV`: `production`
        -   `MONGO_URI`: *(Your MongoDB Atlas connection string)*
        -   `JWT_SECRET`: *(A long random string)*
        -   `REFRESH_TOKEN_SECRET`: *(Another long random string)*
        -   `CLIENT_URL`: *(Leave empty for now, update after deploying frontend)*
5.  **Deploy**: Click **Create Web Service**. Wait for the specific URL (e.g., `https://inkvero-api.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

1.  **Create Project on Vercel**:
    -   Log in to [Vercel](https://vercel.com/).
    -   Click **Add New...** -> **Project**.
    -   Import your `Inkvero` repository.
2.  **Configure Project**:
    -   **Framework Preset**: `Vite`
    -   **Root Directory**: `client` (Edit this field!)
3.  **Environment Variables**:
    -   Expand **Environment Variables**.
    -   Add: `VITE_API_URL`
    -   Value: `https://your-backend-service.onrender.com/api/v1` (The URL from Step 1 + `/api/v1`)
4.  **Deploy**: Click **Deploy**.

---

## 3. Final Configuration

1.  **Update Backend CORS**:
    -   Go back to **Render** -> **Environment**.
    -   Add/Update `CLIENT_URL` to your new Vercel URL (e.g., `https://inkvero.vercel.app`).
    -   **Save Changes** (Render will auto-redeploy).

## Troubleshooting

-   **CORS Errors**: Ensure `CLIENT_URL` in Render matches your Vercel URL exactly (no trailing slash usually).
