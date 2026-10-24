const fs = require('fs');
const path = require('path');

const target = process.argv[2]; // 'postgres' or 'sqlite'
const prismaDir = path.resolve(__dirname, '..', 'prisma');

if (target === 'postgres' || target === 'postgresql') {
  fs.copyFileSync(
    path.join(prismaDir, 'schema.postgresql.prisma'),
    path.join(prismaDir, 'schema.prisma')
  );
  console.log('✓ Switched prisma/schema.prisma to PostgreSQL (Production / Neon / Vercel)');
} else if (target === 'sqlite') {
  fs.copyFileSync(
    path.join(prismaDir, 'schema.sqlite.prisma'),
    path.join(prismaDir, 'schema.prisma')
  );
  console.log('✓ Switched prisma/schema.prisma to SQLite (Local Development)');
} else {
  console.log('Usage: node scripts/switch-db.js [postgres|sqlite]');
}
