import { faker } from '@faker-js/faker'
import { users, restaurants } from './schema'
import { db } from './connection'

// Reset database
await db.delete(users as any)
await db.delete(restaurants as any)

console.log('✔ Database reset complete!')

// Create customers
await db.insert(users as any).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  }
])

console.log('✔ Created customers!')

// Create manager
const [manager] = await db.insert(users as any).values([
  {
    name: faker.person.fullName(),
    email: 'admin@admin.com',
    role: 'manager',
  },
]).returning()

console.log('✔ Created manager!')

// Create restaurant
await db.insert(restaurants as any).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
])

console.log('✔ Created restaurant!')

console.log('✔ Database seed complete!')
process.exit()