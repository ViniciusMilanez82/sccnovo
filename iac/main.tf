terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "scc-ng-terraform-state-bucket-vinicius"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
}

# Módulo da VPC
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  aws_region   = var.aws_region
  vpc_cidr     = var.vpc_cidr
}

# Módulo do RDS (Banco de Dados)
module "rds" {
  source = "./modules/rds"

  project_name          = var.project_name
  vpc_id                = module.vpc.vpc_id
  private_subnets       = module.vpc.private_subnets
  db_username           = var.db_username
  db_password_secret_arn = aws_secretsmanager_secret.db_password.arn
}

# Módulo do ECS (Contêineres da Aplicação)
module "ecs" {
  source = "./modules/ecs"

  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  public_subnets    = module.vpc.public_subnets
  private_subnets   = module.vpc.private_subnets
  alb_security_group = module.vpc.alb_security_group_id
  ecs_security_group = module.vpc.ecs_security_group_id
  db_endpoint       = module.rds.db_endpoint
  db_port           = module.rds.db_port
  db_name           = var.db_name
  jwt_secret_arn    = aws_secretsmanager_secret.jwt_secret.arn
}

# Módulo do S3 (Armazenamento de Arquivos)
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
}

# AWS Secrets Manager para senhas e segredos
resource "aws_secretsmanager_secret" "db_password" {
  name = "${var.project_name}-db-password"
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "${var.project_name}-jwt-secret"
}
