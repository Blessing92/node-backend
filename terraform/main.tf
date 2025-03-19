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
    bucket = "serverless-deploy-task-api"
    key    = "prod/terraform.tfstate"
    region = "eu-central-1"
    dynamodb_table = "terraform-lock"
  }
}

# Network Configuration
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

# Database Configuration
module "aurora" {
  source = "./modules/aurora"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  db_name         = var.db_name
  db_instance_class = "db.serverless"
  min_capacity    = 0.5
  max_capacity    = 4
}

# ECS Configuration
module "ecs" {
  source = "./modules/ecs"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  public_subnet_ids   = module.vpc.public_subnet_ids
  docker_image        = var.docker_image
  db_arn              = module.aurora.db_arn
  secret_arn          = module.aurora.secret_arn
  db_name             = var.db_name
  aws_region          = var.aws_region
  container_port      = 3000
  desired_count       = 2
  task_cpu            = 256
  task_memory         = 512
}
