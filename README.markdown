# Vistagram – Explore and Share Your Adventures! 📸

Vistagram is a full-stack web application inspired by Instagram, designed for travelers and explorers to share their favorite Points of Interest (POIs) with the world. Capture stunning moments using your device's camera, add a descriptive caption, and share your unique travel perspective. Browse a vibrant timeline of posts from other adventurers, like their content, and share fascinating discoveries with your friends.

## ✨ Features

- **Image Capture & Upload**: Easily capture and upload photos directly from your device's camera or select existing images. Securely store your captured memories with accompanying captions in the backend.
- **Dynamic Timeline Feed**: View a chronological feed of all posts, sorted by the newest first.
- **Like/Unlike Functionality**: Engage with posts by liking them. The like count is visible and persisted in the backend.
- **Share Post via Link**: Share posts with others via a direct link, with the share count also displayed and stored in the backend.
- **User Authentication**: Secure sign-up and sign-in processes powered by Supabase.
- **Responsive Design**: A seamless user experience across various devices, from mobile to desktop.

## 🚀 Tech Stack

Vistagram is built using a modern and robust tech stack:

- **Next.js**: A React framework for production, offering server-side rendering and static site generation.
- **Supabase**: An open-source Firebase alternative providing authentication, a PostgreSQL database, and file storage.
- **Prisma**: A next-generation ORM for Node.js and TypeScript, simplifying database interactions.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **Sonner**: A beautifully designed toast component for React.

## ⚙️ Setup Guide

Follow these steps to set up and run Vistagram locally on your machine.

### Prerequisites

- **Node.js**: Version 18.18.0 or later
- **npm**, **Yarn**, **pnpm**, or **Bun**

### 1. Clone the Repository

```bash
git clone https://github.com/Akshat090803/vistagram.git
cd vistagram
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Variables

Create a `.env` file in the root of the project and add the following environment variables. These are crucial for connecting to your Supabase project and database.

```env
DATABASE_URL="postgresql://postgres.dummyuser:dummyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.dummyuser:dummyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://dummyproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15cHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU0NzU2Mzg1LCJleHAiOjIwNzAzMzIzODV9.dummyKey1234567890abcdef"
```

> **Note**: For a production environment or shared development, replace these dummy values with your own Supabase project keys and database URLs.

### 4. Database Setup & Seeding

Vistagram uses Prisma for database management.

#### Run Prisma Migrations

Apply the database schema to your PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

#### Generate Prisma Client

Ensure the Prisma client is generated to interact with your database:

```bash
npx prisma generate
```

#### Seed Initial Data

To populate your database with sample user and post data, run the seeding script:

```bash
npm run seed
# or
yarn seed
# or
pnpm seed
# or
bun seed
```

### 5. Run the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 in your browser to see the result.

## 📚 Learn More

To learn more about Next.js, check out the following resources:

- Next.js Documentation - Learn about Next.js features and API.
- Learn Next.js - An interactive Next.js tutorial.
- Next.js GitHub Repository - Your feedback and contributions are welcome!

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js. Check out the Next.js deployment documentation for more details.

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙌 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## 📧 Contact

For any questions or feedback, feel free to reach out via GitHub Issues.

---

# © 2025 Akshat090803