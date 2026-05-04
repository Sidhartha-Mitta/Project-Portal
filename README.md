# PCP - Project Collaboration Platform

PCP is a full-stack project collaboration platform for connecting project owners with students. Project owners can post projects, review applications, create teams, and monitor progress. Students can discover projects, apply, collaborate in teams, chat in real time, and submit completed work.

## Features

### Project Owners

- Post projects with category, requirements, skills, timeline, and team size.
- Review and manage student applications.
- Shortlist or accept applicants.
- Create teams for selected project members.
- Review project submissions and rate completed work.
- Communicate with teams through real-time chat.

### Students

- Register and maintain a profile with skills and experience.
- Browse and filter available projects.
- Apply to projects with application details and attachments.
- Join assigned teams.
- Use team chat with messages, reactions, and file attachments.
- Submit completed project work.

### Platform

- JWT-based authentication.
- Role-based user flows for students and project owners.
- MongoDB database with Mongoose models.
- Cloudinary-backed file and avatar uploads.
- Socket.IO real-time team communication.
- Responsive React frontend with dark mode support.

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas or local MongoDB
- Mongoose
- Socket.IO
- JSON Web Tokens
- bcryptjs
- Multer
- Cloudinary

### Frontend

- React 19
- Vite
- Tailwind CSS
- Zustand
- React Router
- Axios and Fetch API
- Framer Motion
- React Hot Toast
- Recharts

## Project Structure

```text
PCP/
  backend/
    Controllers/
    Middleware/
    Models/
    Routes/
    config/
    utils/
    server.js
    package.json
    .env.example
  client/
    src/
    package.json
    .env
  README.md
```

## Prerequisites

- Node.js 20 recommended, Node.js 16 or later required.
- npm.
- MongoDB Atlas database or a local MongoDB instance.
- Cloudinary account for image and file uploads.

## Environment Variables

### Backend

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<db-user>:<url-encoded-password>@<cluster-host>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_secret
PORT=5000
FRONTEND_URL=https://project-portal-vert.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

MongoDB notes:

- Use a MongoDB Atlas **Database Access** user, not your Atlas login email.
- If your password contains special characters such as `@`, `#`, `/`, `?`, `:`, or `%`, URL-encode it before adding it to `MONGO_URI`.
- Example: `p@ssword` becomes `p%40ssword`.

### Frontend

Create `client/.env`:

```env
VITE_BACKEND_API_URL=http://localhost:5000/api
```

Restart the Vite dev server after changing `client/.env`; Vite reads env variables only at startup.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Expected backend output:

```text
MongoDB Connected
Server running on port 5000
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Available Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Routes

Base URL:

```text
http://localhost:5000/api
```

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users/:id`
- `PUT /users/:id`

### Projects

- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `GET /projects/user/my-projects`
- `GET /projects/dashboard/data`
- `POST /projects/:id/apply`
- `GET /projects/:id/applications`
- `PUT /projects/:projectId/applications/:applicationId`
- `POST /projects/:id/submit`
- `PUT /projects/:id/submissions/:submissionId`
- `PUT /projects/:id/approve`
- `POST /projects/:id/rate`

### Applications

- `GET /applications/my-applications`
- `GET /applications/:id/applications`
- `PUT /applications/:projectId/applications/:applicationId`

### Teams

- `GET /teams`
- `GET /teams/:id`
- `POST /teams/:id/members`
- `DELETE /teams/:id/members/:userId`
- `GET /teams/:id/messages`
- `POST /teams/:id/messages`
- `PUT /teams/:teamId/messages/:messageId`
- `DELETE /teams/:teamId/messages/:messageId`
- `POST /teams/:teamId/messages/:messageId/reactions`
- `GET /teams/:teamId/messages/:messageId/attachments/:attachmentIndex/download`

## Common Issues

### `bad auth : Authentication failed`

MongoDB Atlas rejected the credentials in `backend/.env`.

Fix:

- Copy a fresh connection string from Atlas.
- Confirm the username/password belongs to a Database Access user.
- URL-encode special characters in the password.

### `querySrv ENOTFOUND`

The MongoDB Atlas host cannot be resolved.

Fix:

- Check the cluster hostname in `MONGO_URI`.
- Confirm your internet/DNS connection works.
- Copy the current driver connection string from Atlas.

### `EADDRINUSE: address already in use`

The backend port is already occupied.

Fix:

```bash
ss -ltnp 'sport = :5000'
```

Then stop the existing process or change `PORT` in `backend/.env` and update `VITE_BACKEND_API_URL` in `client/.env` to match.

### CORS Error

If the browser says the allowed origin does not match `http://localhost:5173`, make sure:

- Backend is running on `http://localhost:5000`.
- `client/.env` has `VITE_BACKEND_API_URL=http://localhost:5000/api`.
- `backend/.env` has `FRONTEND_URL=http://localhost:5173` for local-only development, or `FRONTEND_URL=https://project-portal-vert.vercel.app` for the deployed frontend.
- You restarted both backend and frontend after env changes.

## Build

Build the frontend for production:

```bash
cd client
npm run build
```

The production output is generated in `client/dist`.

## Deployment Notes

Backend deployment:

- Set all backend environment variables on the hosting platform.
- Use the production MongoDB Atlas URI.
- Set `FRONTEND_URL` to the deployed frontend origin: `https://project-portal-vert.vercel.app`.

Frontend deployment:

- Set `VITE_BACKEND_API_URL` to the deployed backend API URL.
- Rebuild the frontend after changing environment variables.

Example:

```env
VITE_BACKEND_API_URL=https://your-backend-domain.com/api
```

## Security Notes

- Do not commit `.env` files.
- Rotate credentials if secrets are ever exposed.
- Use strong `JWT_SECRET` values in production.
- Keep MongoDB Atlas Network Access restricted to trusted IPs where possible.

## License

This project is licensed under the ISC License.
