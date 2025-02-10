# INVIGICLUB BACKEND
## Setup

1. **Clone the repository:**
    ```sh
    git clone Project
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Set up the database:**
    - Copy `.env.example` to `.env` and update the `DATABASE_URL` with your database connection string.
    ```sh
    docker-compose up -d
    ```

4. **Run database migrations:**
    ```sh
    npm run orm-migrate-dev
    ```

5. **Generate Prisma Client:**
    ```sh
    npm run orm-generate
    ```

## Running the Project

1. **Start the development server:**
    ```sh
    npm run dev
    ```

2. **Open your browser and navigate to:**
    ```
    http://localhost:{env_port}
    ```

## Testing

1. **Run tests:**
    ```sh
    npm test
    ```
