# GlobalCanvas

GlobalCanvas is a full-stack School Management System designed to provide a centralized platform for educational institutions. It helps manage students, teachers, classes, and various academic activities, with dedicated dashboards and features for different user roles like Admins, Teachers, Students, and Parents.

## Key Features

*   **Role-Based Access Control:** Different user roles (Admin, Teacher, Student, Parent) with tailored permissions.
*   **Academic Management:** Manage Grades, Classes, Subjects, and Lessons.
*   **User Profiles:** Comprehensive profiles for Students, Teachers, and Parents.
*   **Assignments & Exams:** Create and manage assignments and exams.
*   **Grading & Results:** Track and manage student results for assessments.
*   **Attendance Tracking:** Monitor student attendance for lessons.
*   **Announcements & Events:** Communicate important information and manage school events with a calendar view.
*   **Data Visualization:** Interactive charts for visualizing school data.

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** [Clerk](https://clerk.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** Custom components built with React.
*   **Charts:** [Recharts](httpss://recharts.org/)
*   **Calendar:** [React Big Calendar](http://jquense.github.io/react-big-calendar/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

*   Node.js (v20 or later)
*   npm
*   PostgreSQL

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd GlobalCanvas
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Set up your environment variables by copying the `.env.example` file to a new `.env` file:
    ```bash
    cp .env.example .env
    ```
5.  Update the `.env` file with your database URL and Clerk credentials.
6.  Apply the database migrations:
    ```bash
    npx prisma migrate dev
    ```
7.  (Optional) Seed the database with initial data:
    ```bash
    npx prisma db seed
    ```

### Running the Application

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
