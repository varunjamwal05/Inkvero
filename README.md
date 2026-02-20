# Inkvero

**Inkvero** is a sophisticated social platform tailored for book lovers, designed with a "Quiet Luxury" aesthetic. It allows users to track their reading journey, curate their personal digital library, join reading circles, and engage in meaningful discussions about their favorite books.

The application features a polished "Navy & Cream" theme, offering a serene and premium user experience.

## Features

-   **Personal Library**: Organize and track books you are reading, have read, or want to read.
-   **Reading Circles**: Join or create groups to discuss specific genres or titles with other members.
-   **Book Reviews**: Write and share detailed reviews of books.
-   **Progress Tracking**: Update your reading progress in real-time.
-   **Discovery**: Explore new books and trending titles.
-   **Responsive Design**: A seamless experience across desktop and mobile devices.
-   **Enhanced Notifications**: A modern, non-blocking notification system using `react-hot-toast`.

## Tech Stack

**Inkvero** is built using the MERN stack:

### Frontend
-   **React** (Vite)
-   **Tailwind CSS** for styling
-   **Framer Motion** for animations
-   **React Router** for navigation
-   **Axios** for API integration
-   **React Hot Toast** for notifications

### Backend
-   **Node.js** & **Express**
-   **MongoDB** & **Mongoose** for data storage
-   **sub-dependencies**:
    -   **JWT** for authentication
    -   **Cloudinary** & **Multer** for image uploads
    -   **Bcrypt.js** for password hashing

## Project Structure

The project is organized into two main directories:

-   `client/`: Contains the React frontend application.
-   `server/`: Contains the Express/Node.js backend API.

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn
-   MongoDB Atlas account (or local MongoDB instance)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/inkvero.git
    cd inkvero
    ```

2.  **Install Server Dependencies:**

    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**

    ```bash
    cd ../client
    npm install
    ```

### Configuration

You need to set up environment variables for both the client and server.

1.  **Server (.env)**:
    Create a `.env` file in the `server` directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    CLIENT_URL=http://localhost:5173
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

2.  **Client (.env)**:
    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api/v1
    ```

### Running the Application

1.  **Start the Backend:**

    ```bash
    cd server
    npm run dev
    ```
    The server typically runs on `http://localhost:5000`.

2.  **Start the Frontend:**

    Open a new terminal window:
    ```bash
    cd client
    npm run dev
    ```
    The Vite development server will start, usually on `http://localhost:5173`.

## Deployment

For detailed deployment instructions, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

-   **Frontend**: Deployed on Vercel.
-   **Backend**: Deployed on Render.

## License

This project is licensed under the MIT License.
