import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador padrão
  const adminPassword = await bcrypt.hash('Admin@2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@multiteiner.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@multiteiner.com.br',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log(`✅ Usuário admin criado: ${admin.email}`);

  // Criar usuário gerente
  const gerentePassword = await bcrypt.hash('Gerente@2026!', 12);

  const gerente = await prisma.user.upsert({
    where: { email: 'geraldo@multiteiner.com.br' },
    update: {},
    create: {
      name: 'Geraldo (Gerente)',
      email: 'geraldo@multiteiner.com.br',
      password: gerentePassword,
      role: UserRole.GERENTE,
    },
  });

  console.log(`✅ Usuário gerente criado: ${gerente.email}`);

  // Criar usuário vendedor
  const vendedorPassword = await bcrypt.hash('Vendedor@2026!', 12);

  const vendedor = await prisma.user.upsert({
    where: { email: 'vera@multiteiner.com.br' },
    update: {},
    create: {
      name: 'Vera (Vendedora)',
      email: 'vera@multiteiner.com.br',
      password: vendedorPassword,
      role: UserRole.VENDEDOR,
    },
  });

  console.log(`✅ Usuário vendedor criado: ${vendedor.email}`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Admin:   admin@multiteiner.com.br / Admin@2026!');
  console.log('   Gerente: geraldo@multiteiner.com.br / Gerente@2026!');
  console.log('   Vendedor: vera@multiteiner.com.br / Vendedor@2026!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
