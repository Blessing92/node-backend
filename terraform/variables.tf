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

variable "db_arn" {
  description = "The ARN of the Aurora serverless cluster (optional, will be created if not provided)"
  type        = string
  default     = ""
}

variable "secret_arn" {
  description = "The ARN of the AWS Secrets Manager secret (optional, will be created if not provided)"
  type        = string
  default     = ""
}
