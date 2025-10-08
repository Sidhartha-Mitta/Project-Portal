# PCP - Project Collaboration Platform

A comprehensive full-stack platform that connects project owners with skilled students for collaborative development projects. Built with modern web technologies to facilitate seamless project management, team formation, and real-time communication.

## 🚀 Features

### For Project Owners
- **Post Projects**: Create detailed project listings with requirements, skills needed, and timelines
- **Application Management**: Review student applications, shortlist candidates, and select team members
- **Team Oversight**: Monitor project progress, review submissions, and provide feedback
- **Rating System**: Rate completed projects and individual team members
- **Real-time Communication**: Chat with teams via integrated messaging

### For Students
- **Project Discovery**: Browse projects by category, difficulty, and skills
- **Easy Application**: Submit applications with resumes, cover letters, and proposals
- **Team Collaboration**: Join teams and work together on assigned projects
- **Project Submission**: Submit work with repository links, demos, and file uploads
- **Skill Development**: Gain experience across various technologies and project types

### Platform Features
- **Real-time Chat**: Team-based messaging with typing indicators
- **File Uploads**: Support for resumes, project files, and attachments via Cloudinary
- **Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Dark Mode**: Theme switching capability
- **Advanced Filtering**: Search and filter projects by multiple criteria

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - File storage and management
- **Multer** - File upload handling

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **React Hot Toast** - Notification system
- **Recharts** - Data visualization

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pcp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the Application**

   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd client
   npm run dev
   ```

   The application will be running at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

## 📖 Usage

### Getting Started
1. **Register** as either a project owner or student
2. **Complete your profile** with relevant information
3. **Explore projects** or post new ones

### For Project Owners
1. Navigate to "Post Project" to create a new project listing
2. Review applications in the dashboard
3. Select team members and create teams
4. Monitor progress and provide feedback

### For Students
1. Browse available projects on the home page
2. Apply to projects that match your skills
3. Join teams and collaborate on assigned projects
4. Submit completed work for review

## 🗄 Database Models

### Project Model
- Core project information (title, description, category)
- Skills requirements and difficulty level
- Timeline and team size constraints
- Application management system
- Submission tracking and rating system

### User Model
- Authentication and profile information
- Role-based access (student/project owner)
- Skills and experience tracking

### Team Model
- Team formation and member management
- Project assignment
- Communication channels

### Application Model
- Application tracking with status updates
- Resume and portfolio attachments
- Feedback and rating system

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/project/:projectId` - Get project applications
- `PUT /api/applications/:id/status` - Update application status

### Teams
- `GET /api/teams` - Get user teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- CORS configuration for cross-origin requests
- File upload size limits and validation
- Input sanitization and validation

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Ensure MongoDB connection is configured
3. Deploy to services like Heroku, Railway, or Vercel

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to services like Vercel, Netlify, or GitHub Pages
3. Configure API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support, email support@pcp.com or join our Discord community.

## 🙏 Acknowledgments

- Thanks to all contributors and the open-source community
- Special thanks to the developers of the technologies used in this project