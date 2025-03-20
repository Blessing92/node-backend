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
  description = "Endpoint of the MySQL instance"
  value       = module.mysql.db_instance_endpoint
}

output "db_arn" {
  description = "ARN of the MySQL instance"
  value       = module.mysql.db_instance_arn
}

output "db_secret_arn" {
  description = "ARN of the database secrets"
  value       = module.mysql.db_secret_arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = module.ecs.load_balancer_dns
}
