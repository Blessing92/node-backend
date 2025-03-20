# Task Management API

A RESTful API for managing tasks built with Node.js, Express, and MySQL, deployed on AWS using Terraform.

## Features

- Create, retrieve, update, and delete tasks
- Filter tasks by status, due date, and other criteria
- Pagination and sorting capabilities for task lists
- Comprehensive input validation and error handling
- Unit, integration, and E2E tests
- Database migrations for schema management

## API Endpoints

### Tasks

| Method | Endpoint       | Description                                      |
|--------|----------------|--------------------------------------------------|
| POST   | /api/tasks     | Create a new task                                |
| GET    | /api/tasks     | Get all tasks (with filtering, pagination, sorting) |
| GET    | /api/tasks/:id | Get a specific task by ID                        |
| PUT    | /api/tasks/:id | Update an existing task                          |
| DELETE | /api/tasks/:id | Delete a task                                    |
| GET    | /health        | Health check endpoint                            |

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

Response:
```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the Task Management API",
    "due_date": "2025-04-01T12:00:00Z",
    "status": "pending",
    "created_at": "2025-03-20T02:46:04.579Z",
    "updated_at": "2025-03-20T02:46:04.579Z"
  }
}
```

#### Get Tasks with Filtering and Pagination
```
GET /api/tasks?status=pending&sortBy=due_date&sortOrder=ASC&page=1&limit=10
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "task_id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the Task Management API",
      "due_date": "2025-04-01T12:00:00Z",
      "status": "pending",
      "created_at": "2025-03-20T02:46:04.579Z",
      "updated_at": "2025-03-20T02:46:04.579Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Get Task by ID
```
GET /api/tasks/1
```

#### Update Task
```
PUT /api/tasks/1
Content-Type: application/json

{
  "status": "in-progress"
}
```

#### Delete Task
```
DELETE /api/tasks/1
```

## Bonus Features Implemented

- **Advanced Filtering**: Search tasks by title, description, status, and date ranges
- **Pagination**: Control results with page and limit parameters
- **Sorting**: Order results by any field and direction (ASC/DESC)
- **Transaction Support**: All database operations use transactions for data integrity
- **Optimized Database Queries**: Properly indexed tables for efficient querying

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

4. Run database migrations:
   ```
   npx ts-node src/migrations/run-migrations.ts
   ```

5. The API will be available at `http://localhost:3000`

### Testing

Run the test suite:
```
npm test
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

- **Amazon ECS with Fargate** for containerized execution
- **Application Load Balancer (ALB)** for RESTful endpoints
- **RDS MySQL** for the database
- **CloudWatch** for logging and monitoring
- **AWS Secrets Manager** for managing database credentials
- **VPC with public and private subnets** for network isolation

Database configurations are provided via `terraform/module/mysql`.

### Live API

The API is currently deployed and accessible at:
[http://task-api-prod-alb-871306809.eu-central-1.elb.amazonaws.com/](http://task-api-prod-alb-871306809.eu-central-1.elb.amazonaws.com/)

You can test the API endpoints using this URL, for example:
```
GET http://task-api-prod-alb-871306809.eu-central-1.elb.amazonaws.com/health
GET http://task-api-prod-alb-871306809.eu-central-1.elb.amazonaws.com/api/tasks
```

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
   terraform plan -var="docker_image=your-ecr-repo/task-api:latest" -var="db_name=taskmanagementapi" -out=tfplan
   ```

4. Apply the execution plan:
   ```
   terraform apply tfplan
   ```

## Database

### Schema

The database schema includes the following table:

#### Tasks Table

| Column      | Type         | Description                             |
|-------------|--------------|-----------------------------------------|
| task_id     | INT          | Primary key, auto-increment             |
| title       | VARCHAR(100) | Task title                              |
| description | TEXT         | Task description                        |
| due_date    | DATETIME     | Task due date                           |
| status      | ENUM         | Task status (pending, in-progress, completed) |
| created_at  | TIMESTAMP    | Record creation timestamp               |
| updated_at  | TIMESTAMP    | Record last update timestamp            |

### Indexes

The following indexes are configured for optimal performance:

- `tasks_title`: Index on `title` column for text searches
- `tasks_due_date`: Index on `due_date` column for date filtering and sorting
- `tasks_status`: Index on `status` column for filtering by status

### Migrations

Database schema changes are managed through a migrations system that:
- Tracks completed migrations in a dedicated `migrations` table
- Ensures migrations are only applied once
- Executes migrations in a transaction for rollback safety
- Automatically runs in production environments during application startup

## Architecture

The application follows a layered architecture:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Implement business logic
3. **Repositories**: Manage data access
4. **Models**: Define database schema
5. **Middleware**: Process requests (validation, logging, error handling)
6. **Config**: Manage application configuration

## Error Handling

The API implements a standardized error handling approach:

- HTTP-specific error classes (BadRequestException, NotFoundException, etc.)
- Consistent error response format
- Detailed validation error messages
- Transaction rollback on errors

## License

MIT
