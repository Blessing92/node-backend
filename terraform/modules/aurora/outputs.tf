output "db_endpoint" {
  description = "Endpoint of the Aurora cluster"
  value       = aws_rds_cluster.main.endpoint
}

output "db_arn" {
  description = "ARN of the Aurora cluster"
  value       = aws_rds_cluster.main.arn
}

output "secret_arn" {
  description = "ARN of the database secrets"
  value       = aws_secretsmanager_secret.db_credentials.arn
}
