variable "aws_region" {
  description = "AWS region where resources are deployed"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "task-api"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "docker_image" {
  description = "The Docker image to deploy"
  type        = string
}

variable "db_name" {
  description = "The name of the database"
  type        = string
}

variable "db_secret_arn" {
  description = "The ARN of the AWS Secrets Manager secret for MySQL (optional, will be created if not provided)"
  type        = string
  default     = ""
}

variable "db_instance_class" {
  description = "The instance class for the MySQL RDS instance"
  type        = string
  default     = "db.t3.small"
}

variable "allocated_storage" {
  description = "The allocated storage in gibibytes for MySQL RDS"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage allocation for autoscaling MySQL RDS"
  type        = number
  default     = 100
}

variable "multi_az" {
  description = "Whether to deploy the MySQL RDS instance in multiple availability zones"
  type        = bool
  default     = false
}
