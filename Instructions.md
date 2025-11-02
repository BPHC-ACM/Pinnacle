📥 1. Clone the Repository
git clone <repo-url>
cd <project-folder>

🔧 2. Install Dependencies
npm install

🐳 3. Start the Postgres Database (Docker)

Start the database container:

docker compose up -d


This will:

Start Postgres inside Docker

Expose it on localhost:5433

Create the database with the correct name, user, and password

To stop the DB container:

docker compose down

🔑 4. Environment Variables

Copy the example environment file and update if needed:

cp .env.example .env


Ensure your .env file contains:

DATABASE_URL="postgresql://postgres:password@localhost:5433/pinnacle?schema=public"

🧱 5. Apply Migrations

Run Prisma migrations to create the database schema:

npx prisma migrate dev


This will:

Create tables in the database

Generate the Prisma Client

🧠 6. (Optional) View the Database

To open Prisma Studio (DB UI):

npx prisma studio