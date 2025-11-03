import db from '@/db';
import { seedItaly } from '@/db/add_dummy';

async function main() {
  try {
    console.log('Seeding database...');
    await seedItaly(db);
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
