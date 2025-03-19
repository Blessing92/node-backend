output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "db_endpoint" {
  description = "Endpoint of the Aurora cluster"
  value       = module.aurora.db_endpoint
}

output "db_arn" {
  description = "ARN of the Aurora cluster"
  value       = module.aurora.db_arn
}

output "secret_arn" {
  description = "ARN of the database secrets"
  value       = module.aurora.secret_arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = module.ecs.load_balancer_dns
}
