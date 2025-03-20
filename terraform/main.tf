provider "aws" {
  region = var.aws_region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "serverless-deploy-task-api"
    key          = "prod/terraform.tfstate"
    region       = "eu-central-1"
    use_lockfile = true
  }
}

# Network Configuration
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

# Database Configuration - Updated from Aurora to MySQL
module "mysql" {
  source = "./modules/mysql"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  db_name               = var.db_name
  db_instance_class     = var.db_instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  multi_az              = var.multi_az
  docker_image          = var.docker_image
  aws_region            = var.aws_region
  ecs_security_group_id = module.ecs.ecs_security_group_id
}

# ECS Configuration - Updated to work with MySQL
module "ecs" {
  source = "./modules/ecs"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  public_subnet_ids = module.vpc.public_subnet_ids
  docker_image      = var.docker_image
  db_secret_arn     = module.mysql.db_secret_arn
  db_name           = var.db_name
  aws_region        = var.aws_region
  container_port    = 3000
  desired_count     = 2
  task_cpu          = 256
  task_memory       = 512
}
