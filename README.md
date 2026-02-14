# Claims Management System (Monorepo)

This repository contains a full-stack **Claims Management System**,
built with **NestJS** (Backend) and **Angular** (Frontend).

## Project Structure

The project is organized as a monorepo to simplify development and
deployment:

-   **`/backend`**: REST API using NestJS and Mongoose.
-   **`/frontend`**: Reactive UI using Angular 21 and Signals.

------------------------------------------------------------------------

## Getting Started

Follow these step-by-step instructions to set up the project locally.

### 1. Prerequisites

Ensure you have the following installed on your machine: \* **Node.js**
(v18 or higher) \* **npm** (Node Package Manager)

### 2. Installation

It is configured a unified command to install all dependencies for the
root, backend, and frontend in one go.

Open your terminal in the root directory of the project and run:

``` bash
npm run setup
```

## Configuration

For security reasons, the database connection string (MongoDB Atlas) is not included in the public repository. You must configure it manually.

1.  Navigate to the backend folder:

``` bash
cd backend
```

2.  Create the .env file\
    Duplicate the example file to create your local configuration.

**Windows (Command Prompt / PowerShell):**

``` bash
copy .env.example .env
```

**Mac / Linux:**

``` bash
cp .env.example .env
```

3.  Update the .env file\
    Open the newly created .env file in your code editor.

> **Action Required:** Replace the placeholder value of `MONGO_URI` with
> the actual connection string provided via email.

4.  Return to the root directory:

``` bash
cd ..
```

## Running the Application

From the root directory, run the start command. This uses concurrently
to launch both the Backend API and the Frontend UI simultaneously in a
single terminal window:

``` bash
npm run start
```

Once the servers are running, access the application at:

-   **Frontend (UI):** http://localhost:4200\

------------------------------------------------------------------------

## Testing & Coverage

The project enforces a strict testing policy with over 95% code coverage
in the backend, utilizing Jest and In-Memory MongoDB for integration
tests.

To run the unit tests and generate the coverage report, run this command
from the root directory:

``` bash
npm run test:cov
```

This will execute the test suites and output a detailed coverage table
in your terminal. After running the command, a detailed HTML report is automatically generated. You can open it in your browser by accessing the following path:

    Path: backend/coverage/lcov-report/index.html

