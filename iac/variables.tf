variable "aws_region" {
  description = "Região da AWS para implantar os recursos."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto, usado para nomear recursos."
  type        = string
  default     = "scc-ng"
}

variable "vpc_cidr" {
  description = "Bloco CIDR para a VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "Usuário master do banco de dados RDS."
  type        = string
  default     = "sccadmin"
}

variable "db_name" {
  description = "Nome do banco de dados inicial no RDS."
  type        = string
  default     = "scc_ng_db"
}
