
import { internalPermissions } from './seeds/permission.seed';
import * as bcrypt from 'bcrypt';
import { profilesData } from './seeds/perfil.seed';
import { PrismaClient } from '@prisma/client';
import { internalCategory } from './seeds/category.seed';


const prisma = new PrismaClient({} as any);

async function main() {
  console.log(`Iniciando o seeding...`);

  // --- SEED: PERMISSÕES ---
  const permissionMap: Record<string, string> = {};
  for (const permissionData of internalPermissions) {
    const permission = await prisma.permission.upsert({
      where: { name: permissionData.name },
      update: { label: permissionData.label },
      create: { name: permissionData.name, label: permissionData.label },
    });
    permissionMap[permissionData.name] = permission.id;
  }
  console.log('Permissões criadas com sucesso!');

  // --- SEED: PERFIS ---
  for (const profileData of profilesData) {
    await prisma.profile.upsert({
      where: { name: profileData.name },
      update: {
        label: profileData.label,
        description: profileData.description,
        permissions: {
          set: profileData.permissions.map(pName => ({ name: pName })),
        },
      },
      create: {
        name: profileData.name,
        label: profileData.label,
        description: profileData.description,
        permissions: {
          connect: profileData.permissions.map(pName => ({ name: pName })),
        },
      },
    });
  }
  console.log('Perfis criados com sucesso!');

await prisma.category.createMany({
  data: internalCategory,
  skipDuplicates: true,
});

  // --- SEED: ADMIN PADRÃO ---
  const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'isaac.bunga@outlook.com').trim();
  const defaultPassword = (process.env.DEFAULT_ADMIN_PASS || '123456').trim();

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: defaultEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const generalAdminProfile = await prisma.profile.findUnique({
      where: { name: 'GENERAL_ADMIN' },
      select: { id: true },
    });

    if (!generalAdminProfile) {
      throw new Error("Perfil 'GENERAL_ADMIN' não encontrado.");
    }

    await prisma.admin.create({
      data: {
        fisrtName: 'Issac',
        lastName: 'Bunga',
        phone: '930333042',
        email: defaultEmail,
        identityNumber: '000000000LA001',
        isRoot: true,
        passwordHash: hashedPassword,
        profile: { connect: { id: generalAdminProfile.id } },
      },
    });

    console.log(`Admin padrão criado: ${defaultEmail}`);
  } else {
    console.log(`Admin já existe: ${defaultEmail}`);
  }

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });