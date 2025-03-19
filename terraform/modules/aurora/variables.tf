variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "IDs of the subnets"
  type        = list(string)
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_instance_class" {
  description = "Instance class for the database"
  type        = string
  default     = "db.serverless"
}

variable "min_capacity" {
  description = "Minimum capacity for Aurora Serverless v2"
  type        = number
  default     = 0.5
}

variable "max_capacity" {
  description = "Maximum capacity for Aurora Serverless v2"
  type        = number
  default     = 4
}
