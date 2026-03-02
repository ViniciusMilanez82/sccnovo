output "vpc_id" {
  description = "O ID da VPC criada."
  value       = aws_vpc.main.id
}

output "public_subnets" {
  description = "Lista de IDs das subnets públicas."
  value       = aws_subnet.public[*].id
}

output "private_subnets" {
  description = "Lista de IDs das subnets privadas."
  value       = aws_subnet.private[*].id
}

output "alb_security_group_id" {
  description = "O ID do security group para o ALB."
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "O ID do security group para as tasks do ECS."
  value       = aws_security_group.ecs.id
}
