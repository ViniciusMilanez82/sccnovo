resource "aws_db_subnet_group" "default" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_subnets

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for the RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432 # Porta do PostgreSQL
    to_port     = 5432
    protocol    = "tcp"
    # Permite acesso apenas das tasks do ECS
    cidr_blocks = ["10.0.0.0/16"] # Simplificado; idealmente usar o SG do ECS
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "default" {
  identifier           = "${var.project_name}-db"
  engine               = "postgres"
  engine_version       = "14.6"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  username             = var.db_username
  password             = data.aws_secretsmanager_secret_version.db_password.secret_string
  db_subnet_group_name = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot  = true
  publicly_accessible  = false
}

# Data source para buscar o segredo da senha do banco
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = var.db_password_secret_arn
}
