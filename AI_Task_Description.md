# 🧠 **AI Development Task Description: Project Portal Dashboard Builder**

## 🎯 **Objective**

Build **two dashboards** — one for **Students** and one for **Industry Users** — both as **single-page, section-based React components** with fully functional workflows, data integration, and backend connectivity.
These dashboards are part of a **Project Collaboration Portal** connecting students and industries for real-world project development.

The backend should be built using **Node.js + Express + MongoDB**, and the frontend using **React.js + TailwindCSS**.
All data must be fetched dynamically from the API, and JWT authentication should restrict access based on role.

---

## ⚙️ **General System Workflow**

1. **Authentication:**

   * Login with role-based JWT (`student`, `industry`).
   * Redirect student → `/student/dashboard`
   * Redirect industry → `/industry/dashboard`
2. **Database Collections:**

   * `Users` (stores student/industry info)
   * `Projects` (posted projects by industries)
   * `Applications` (student applied projects)
   * `Submissions` (student project submissions)
   * `Feedbacks` (ratings + reviews)
3. **File Upload:**

   * Use **Multer** for ZIP file upload.
   * Store ZIP file URL + GitHub link + optional live project link.
4. **Ratings:**

   * Supports **hybrid rating system** (project-wide or individual ratings per student).
   * Ratings update automatically in student dashboards.

---

## 🎓 **STUDENT DASHBOARD (Single Page, Section-Based)**

### 🧩 **Sections**

#### 1️⃣ Overview / Analytics Section

* Displays 4 summary cards:

  * `Applied Projects`
  * `Accepted Projects`
  * `Rejected Projects`
  * `Completed Projects`
* Shows charts (using `recharts` or `chart.js`) for:

  * Project status distribution.
  * Average rating trend (based on industry feedback).
* Data fetched dynamically via `/api/student/stats`.

---

#### 2️⃣ Applied Projects Section

* Lists all projects the student applied for.
* Each project card displays:

  * Project Title
  * Industry Name
  * Applied Date
  * Current Status (Pending/Under Review)
* "View Details" button opens modal showing:

  * Full project description
  * Requirements
  * Industry contact
* Data endpoint: `/api/student/applied-projects`

---

#### 3️⃣ Accepted Projects Section

* Lists projects accepted by industries.
* Each card shows:

  * Project info + expected deadline.
  * Submission form:

    * **GitHub Link (required)** or **ZIP Upload (required)**
    * **Live Link (optional)**
  * `Submit Project` button:

    * Validates inputs.
    * Uploads data via `/api/student/submit-project`
  * Once submitted → project status becomes `"In Progress"`.
* Displays upload progress and success confirmation.

---

#### 4️⃣ Completed Projects Section

* Lists all projects completed and rated by industry.
* Each project card displays:

  * Project Title and Submission Links (GitHub / ZIP / Live)
  * **Rating Section**:

    * If project was rated project-wide → show same rating and feedback for all.
    * If rated individually → show only the logged-in student's rating + feedback.
  * Example Display:

    ```
    ⭐ 4.5 — "Well executed and creative solution."
    ```
  * "View Feedback" button opens modal showing full review and comments.
* Data endpoint: `/api/student/completed-projects`

---

#### 5️⃣ Analytics Section (Optional)

* Charts and visual insights:

  * Total Projects by Status
  * Ratings Over Time
  * Feedback Sentiment (Positive/Neutral/Negative)
* Backend endpoint: `/api/student/analytics`

---

### 🧱 **Frontend Layout (React + Tailwind)**

```
StudentDashboard.jsx
 ├── SummaryCards.jsx
 ├── Tabs / Accordion Components:
 │     • AppliedProjects.jsx
 │     • AcceptedProjects.jsx
 │     • CompletedProjects.jsx
 │     • AnalyticsCharts.jsx
 └── Footer.jsx
```

* Use `react-tabs` or `framer-motion` accordion for switching sections without page reload.
* Responsive design for both desktop and mobile.

---

## 🏢 **INDUSTRY DASHBOARD (Single Page, Section-Based)**

### 🧩 **Sections**

#### 1️⃣ Overview / Analytics Section

* Displays 4 cards:

  * `Total Posted Projects`
  * `In Progress Projects`
  * `Completed Projects`
  * `Pending Submissions`
* Optional Chart: Submissions timeline / completion trend.
* Data from `/api/industry/stats`.

---

#### 2️⃣ Posted Projects Section

* Lists all posted projects by the industry user.
* Each project card includes:

  * Title, Description, Applicant Count.
  * Buttons:

    * `View Applicants`
    * `Edit Project`
    * `Delete Project`
* `View Applicants` opens a modal with a list of students who applied (fetched from `/api/industry/applicants/:projectId`).
* Option to **Accept/Reject applications**.

---

#### 3️⃣ In-Progress Projects Section

* Lists all projects currently being developed by students.
* Each card includes:

  * Team/Student Info.
  * Submitted ZIP / GitHub / Live Demo Links.
  * Verification Controls:

    * ✅ `Mark as Complete`
    * 🔁 `Request Modification` (text area for feedback)
* "Mark as Complete" triggers **Rating Modal (Hybrid System)**.

---

#### 4️⃣ Rating Modal (Hybrid Rating System)

* When marking project as complete:

  * Toggle Option:

    * 🔘 **Rate the Project (Team Rating)**

      * Single star rating + feedback.
    * 🔘 **Rate Each Student Individually**

      * Table listing each student with:

        * Star Rating
        * Feedback Input
  * On submit:

    * Sends data to `/api/industry/rate-project`
    * Backend applies:

      * If **Project Rating** → same rating to all.
      * If **Individual Rating** → stores rating per student.
* Confirmation message: "Project rated successfully."

---

#### 5️⃣ Completed Projects Section

* Displays all verified and completed projects.
* Each card includes:

  * Project Info
  * Team Members + Submitted Links
  * Ratings (project-wide or individual)
  * Industry Feedback Summary
  * "View Details" button opens full record modal.

---

#### 6️⃣ Feedback Management Section (Optional)

* Shows list of all feedback given to students.
* Filters by:

  * Project Name
  * Rating Range
  * Date Range
* Endpoint: `/api/industry/feedback-history`

---

### 🧱 **Frontend Layout (React + Tailwind)**

```
IndustryDashboard.jsx
 ├── SummaryCards.jsx
 ├── Tabs / Accordion Components:
 │     • PostedProjects.jsx
 │     • InProgressProjects.jsx (includes Rating Modal)
 │     • CompletedProjects.jsx
 │     • FeedbackManager.jsx
 │     • AnalyticsCharts.jsx
 └── Footer.jsx
```

* Use shared UI components for card layouts and modals.
* Include toast notifications (`react-hot-toast`) for success/error messages.

---

## 🗂️ **Key Backend APIs Summary**

| Method | Endpoint                              | Description                             |
| ------ | ------------------------------------- | --------------------------------------- |
| GET    | `/api/student/stats`                  | Fetch student project summary counts    |
| GET    | `/api/student/applied-projects`       | Get applied project list                |
| POST   | `/api/student/submit-project`         | Submit project with GitHub/ZIP          |
| GET    | `/api/student/completed-projects`     | Get completed projects and ratings      |
| GET    | `/api/industry/stats`                 | Fetch overview analytics                |
| GET    | `/api/industry/applicants/:projectId` | View applicants for a project           |
| POST   | `/api/industry/accept-application`    | Accept student/team                     |
| POST   | `/api/industry/request-modification`  | Ask for resubmission                    |
| POST   | `/api/industry/rate-project`          | Submit hybrid ratings (team/individual) |
| GET    | `/api/industry/feedback-history`      | Fetch feedback logs                     |

---

## 💾 **Tech Stack**

* **Frontend:** React.js, TailwindCSS, Framer Motion, Recharts, React Hook Form
* **Backend:** Node.js, Express.js, Mongoose
* **Database:** MongoDB
* **Auth:** JWT Role-Based
* **File Upload:** Multer (ZIP file)
* **Hosting:** Render / Netlify / Vercel

---

## 🚀 **Expected Output**

An end-to-end working **Student & Industry Dashboard** system where:

* Students can apply, submit, view feedback, and track analytics.
* Industries can post, verify, rate, and manage feedback.
* Ratings and feedback dynamically update for all students or individuals.
* Dashboard navigation works within a single page via tabs or accordion components.