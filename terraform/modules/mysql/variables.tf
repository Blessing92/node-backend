variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where resources will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the database subnet group"
  type        = list(string)
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t3.small"
}

variable "allocated_storage" {
  description = "The allocated storage in gibibytes"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage allocation for autoscaling"
  type        = number
  default     = 100
}

variable "multi_az" {
  description = "Whether to deploy the RDS instance in multiple availability zones"
  type        = bool
  default     = false
}

variable "docker_image" {
  description = "Docker image for the application"
  type        = string
}

variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "eu-central-1"
}

variable "ecs_security_group_id" {
  description = "ID of the ECS security group"
  type        = string
  default     = ""
}
