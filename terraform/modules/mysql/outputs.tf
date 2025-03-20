output "db_instance_id" {
  description = "The ID of the MySQL RDS instance"
  value       = aws_db_instance.main.id
}

output "db_instance_address" {
  description = "The address of the MySQL RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_endpoint" {
  description = "The connection endpoint of the MySQL RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_arn" {
  description = "The ARN of the MySQL RDS instance"
  value       = aws_db_instance.main.arn
}

output "db_secret_arn" {
  description = "The ARN of the secret containing database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "db_security_group_id" {
  description = "The ID of the security group associated with the MySQL RDS instance"
  value       = aws_security_group.db.id
}
