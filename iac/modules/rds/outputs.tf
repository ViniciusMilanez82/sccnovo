output "db_endpoint" {
  description = "O endpoint do banco de dados RDS."
  value       = aws_db_instance.default.endpoint
}

output "db_port" {
  description = "A porta do banco de dados RDS."
  value       = aws_db_instance.default.port
}
