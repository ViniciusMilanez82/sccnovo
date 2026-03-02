# ADR-SCC-002: Infraestrutura e Deploy na AWS

**Projeto**: SCC-NG (Next Generation)
**Autor**: ms-cto-eduardo + ms-devops-fernanda (Manus AI)
**Data**: 02 de Março de 2026
**Status**: ✅ Aceito
**Referência PRD**: PRD-SCC-MVP v1.1
**Referência ADR**: ADR-SCC-001

---

## 1. Contexto

Com o stack tecnológico definido (Node.js + React + PostgreSQL), é necessário definir a arquitetura de infraestrutura na AWS que suportará o SCC-NG em produção. A decisão deve equilibrar custo, simplicidade operacional, escalabilidade e segurança, considerando que o time de operações é enxuto (agente DevOps Fernanda) e o sistema precisa de alta disponibilidade em horário comercial.

**Forças e Restrições:**
- Infraestrutura na AWS (decisão do cliente).
- Disponibilidade mínima de 99.5% em horário comercial.
- Custo operacional deve ser otimizado para o porte atual da Multiteiner.
- O time de DevOps é composto por um único agente (Fernanda), portanto a solução deve ser simples de operar.
- Necessidade de ambientes separados: desenvolvimento, staging e produção.

---

## 2. Decisão

**Arquitetura adotada: AWS com serviços gerenciados (PaaS-first)**

| Componente | Serviço AWS | Justificativa |
| :--- | :--- | :--- |
| **Backend (API Node.js)** | AWS Elastic Beanstalk ou ECS Fargate | Gerenciado, sem necessidade de gerenciar servidores EC2. |
| **Frontend (React)** | AWS S3 + CloudFront | Hospedagem estática de altíssima performance e baixo custo. |
| **Banco de Dados** | AWS RDS for PostgreSQL (Multi-AZ) | Gerenciado, backups automáticos, failover automático. |
| **Armazenamento de Arquivos** | AWS S3 | Para documentos gerados (Aceites, Remessas CNAB). |
| **Secrets Manager** | AWS Secrets Manager | Gerenciamento seguro de credenciais e variáveis de ambiente. |
| **CDN** | AWS CloudFront | Distribuição do frontend com baixa latência. |
| **DNS** | AWS Route 53 | Gerenciamento de domínio e roteamento. |
| **Certificados SSL** | AWS Certificate Manager (ACM) | Certificados SSL/TLS gratuitos e gerenciados. |
| **Logs e Monitoramento** | AWS CloudWatch | Logs centralizados, métricas e alertas. |
| **CI/CD** | GitHub Actions → AWS | Deploy automatizado via GitHub Actions. |

---

## 3. Arquitetura de Ambientes

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Account                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  DEV (local) │  │   STAGING    │  │   PRODUCTION     │  │
│  │              │  │              │  │                  │  │
│  │ Docker       │  │ ECS Fargate  │  │ ECS Fargate      │  │
│  │ Compose      │  │ (t3.small)   │  │ (t3.medium x2)   │  │
│  │              │  │              │  │                  │  │
│  │ PostgreSQL   │  │ RDS Postgres │  │ RDS Postgres     │  │
│  │ (container)  │  │ (t3.micro)   │  │ (t3.small Multi- │  │
│  │              │  │              │  │  AZ)             │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Compartilhado (todos os ambientes)                  │   │
│  │  S3 (arquivos) │ CloudFront │ Route 53 │ ACM │ CW   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Estratégia de Deploy

### Ambientes

| Ambiente | Trigger | Propósito |
| :--- | :--- | :--- |
| **dev** | Push em qualquer branch `feature/*` | Desenvolvimento local com Docker Compose |
| **staging** | Merge em `staging` | Testes de integração e validação de QA |
| **production** | Merge em `main` (aprovação manual) | Produção |

### Estratégia de Deploy em Produção: Blue-Green

Para garantir zero downtime em produção, será adotada a estratégia **Blue-Green Deployment**:
1. A versão atual está rodando no ambiente "Blue".
2. A nova versão é implantada no ambiente "Green".
3. Após os smoke tests passarem no "Green", o tráfego é redirecionado via Load Balancer.
4. O ambiente "Blue" fica em standby por 30 minutos para rollback imediato, se necessário.

---

## 5. Alternativas Consideradas

### Alternativa A: Kubernetes (EKS)

| | |
|---|---|
| **Prós** | Máxima flexibilidade, escalabilidade automática granular, padrão da indústria. |
| **Contras** | Altíssima complexidade operacional para um time de DevOps enxuto. Custo elevado. Overkill para o porte atual. |
| **Motivo da Rejeição** | A complexidade operacional do EKS é desproporcional ao porte e ao time da Multiteiner neste momento. ECS Fargate oferece 80% dos benefícios com 20% da complexidade. |

### Alternativa B: Servidor EC2 Dedicado (IaaS puro)

| | |
|---|---|
| **Prós** | Controle total, custo potencialmente menor para cargas previsíveis. |
| **Contras** | Responsabilidade total pelo SO, patches de segurança, escalabilidade manual. Alto risco operacional para um time enxuto. |
| **Motivo da Rejeição** | O modelo PaaS (ECS Fargate + RDS) reduz drasticamente o overhead operacional, que é a prioridade para este projeto. |

### Alternativa C: Heroku / Railway / Render (PaaS de terceiros)

| | |
|---|---|
| **Prós** | Simplicidade máxima, deploy em minutos. |
| **Contras** | Vendor lock-in em plataforma de terceiro, menor controle de segurança e compliance, custo pode ser elevado em escala. |
| **Motivo da Rejeição** | A AWS foi escolhida pelo cliente. Manter tudo na AWS garante consistência e evita dependência de múltiplos provedores. |

---

## 6. Consequências (Trade-offs)

| Aspecto | Impacto |
| :--- | :--- |
| **Custo Estimado (Produção)** | ~$150-300/mês para o porte inicial (RDS t3.small Multi-AZ + ECS Fargate + S3 + CloudFront). |
| **Simplicidade Operacional** | ✅ **Positivo**: ECS Fargate e RDS são gerenciados pela AWS, sem necessidade de gerenciar SO ou patches. |
| **Disponibilidade** | ✅ **Positivo**: RDS Multi-AZ garante failover automático. ECS Fargate reinicia containers com falha automaticamente. |
| **Segurança** | ✅ **Positivo**: AWS Secrets Manager garante que credenciais nunca fiquem no código. VPC isola os recursos. |
| **Escalabilidade** | ✅ **Positivo**: ECS Fargate escala horizontalmente de forma automática. RDS pode ser escalado verticalmente com downtime mínimo. |
| **Vendor Lock-in** | ⚠️ **Risco Baixo**: O uso de containers Docker mitiga o lock-in. A aplicação pode ser migrada para outro cloud com esforço moderado. |

---

## 7. Plano de Implementação

**Semana 1 (ms-devops-fernanda):**
- [ ] Criar conta AWS e configurar IAM com least privilege.
- [ ] Criar repositório `sccnovo` no GitHub.
- [ ] Configurar o ambiente de desenvolvimento local com Docker Compose.
- [ ] Criar VPC, subnets e security groups na AWS.

**Semana 2 (ms-devops-fernanda):**
- [ ] Provisionar RDS PostgreSQL para staging.
- [ ] Configurar ECS Fargate para staging.
- [ ] Configurar S3 + CloudFront para o frontend de staging.
- [ ] Implementar pipeline CI/CD no GitHub Actions para staging.

**Semana 3 (ms-devops-fernanda):**
- [ ] Provisionar RDS PostgreSQL Multi-AZ para produção.
- [ ] Configurar ECS Fargate para produção com Blue-Green.
- [ ] Configurar AWS Secrets Manager.
- [ ] Configurar CloudWatch para logs e alertas.
- [ ] Configurar Route 53 e ACM para o domínio.

---

## 8. Plano de Rollback

**Critério para acionar rollback de infraestrutura**: Falha crítica em produção que não seja resolvida em 30 minutos.

**Passos para reverter (Blue-Green)**:
1. Redirecionar o tráfego do Load Balancer de volta para o ambiente "Blue" (versão anterior).
2. Investigar a causa da falha no ambiente "Green".
3. Corrigir e re-implantar.

**Impacto do rollback**: Mínimo. O Blue-Green garante que a versão anterior esteja sempre disponível para rollback imediato.

---

## Próximos Passos

- **ms-devops-fernanda**: Executar o Plano de Implementação acima. → Gerar `RUNBOOK-SCC-NG.md`.
- **ms-cto-eduardo**: Revisar a configuração de segurança (VPC, Security Groups, IAM) antes do go-live.
- **ms-dev-renata + ms-dev-andre**: Garantir que a aplicação seja stateless e compatível com deploy em containers.
