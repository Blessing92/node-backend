# Task Management API

A RESTful API for managing tasks built with Node.js, Express, and MySQL, deployed on AWS using Terraform.

## Features

- Create, retrieve, update, and delete tasks
- Filter tasks by status, due date, and other criteria
- Pagination and sorting capabilities for task lists
- Comprehensive input validation and error handling
- Unit, integration, and E2E tests

## API Endpoints

### Tasks

| Method | Endpoint       | Description                                      |
|--------|----------------|--------------------------------------------------|
| POST   | /api/tasks     | Create a new task                                |
| GET    | /api/tasks     | Get all tasks (with filtering, pagination, sorting) |
| GET    | /api/tasks/:id | Get a specific task by ID                        |
| PUT    | /api/tasks/:id | Update an existing task                          |
| DELETE | /api/tasks/:id | Delete a task                                    |

### Request and Response Examples

#### Create a Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the Task Management API",
  "due_date": "2025-04-01T12:00:00Z",
  "status": "pending"
}
```

#### Get Tasks with Filtering and Pagination
```
GET /api/tasks?status=pending&sortBy=due_date&order=asc&page=1&limit=10
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- AWS CLI configured
- Terraform CLI (v1.0 or higher)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/task-management-api.git
   cd task-management-api
   ```

2. Create a `.env` file in the root directory with the following environment variables:
   ```
   DB_NAME=taskmanagement
   DB_USER=user
   DB_PASSWORD=password
   DB_PORT=3306
   DB_HOST=localhost
   DB_ROOT_PASSWORD=rootpassword
   NODE_ENV=development
   PORT=3000
   ```

3. Build and run the application using Docker Compose:
   ```
   docker compose build
   docker compose up
   ```

4. The API will be available at `http://localhost:3000`

### Testing

Run the test suite:
```
docker compose run api npm test
```

This will execute unit, integration, and E2E tests and generate coverage reports which can be found in the `coverage` directory.

## AWS Deployment

### CI/CD Pipeline

This project uses GitHub Actions for CI/CD. The workflow includes:

1. Linting and type checking
2. Unit tests
3. Integration tests
4. Validation tests
5. E2E tests
6. Deployment to AWS using Terraform

### Setting up AWS Credentials in GitHub Actions

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Actions
3. Add the following repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

### Infrastructure

The AWS infrastructure is provisioned using Terraform:

- API Gateway for RESTful endpoints
- Lambda functions for serverless execution
- RDS MySQL for the database
- CloudWatch for logging and monitoring

Database configurations are provided via `terraform/module/mysql`.

### Manual Deployment

If you want to deploy manually:

1. Navigate to the terraform directory:
   ```
   cd terraform
   ```

2. Initialize Terraform:
   ```
   terraform init
   ```

3. Create an execution plan:
   ```
   terraform plan -out=tfplan
   ```

4. Apply the execution plan:
   ```
   terraform apply tfplan
   ```

## Database Schema

The database schema includes the following table:

### Tasks Table

| Column      | Type         | Description                             |
|-------------|--------------|-----------------------------------------|
| task_id     | INT          | Primary key, auto-increment             |
| title       | VARCHAR(255) | Task title                              |
| description | TEXT         | Task description                        |
| due_date    | DATETIME     | Task due date                           |
| status      | ENUM         | Task status (pending, in-progress, completed) |
| created_at  | TIMESTAMP    | Record creation timestamp               |
| updated_at  | TIMESTAMP    | Record last update timestamp            |

## License

MIT
