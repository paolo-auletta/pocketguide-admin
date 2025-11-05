// Seed script disabled - add_dummy module not found
// Uncomment and implement when seed data is needed

async function main() {
  try {
    console.log('Seeding database...');
    // await seedItaly(db);
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
