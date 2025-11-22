import * as bcrypt from 'bcrypt';

const generateObjectId = () => {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

async function generate() {
    const password = 'Admin123!';
    const hash = await bcrypt.hash(password, 10);

    const tenantId = generateObjectId();
    const userId = generateObjectId();
    const now = new Date().toISOString();

    console.log('// Run these commands in your MongoDB shell or Compass:');
    console.log('');

    console.log(`// 1. Create System Tenant`);
    console.log(`db.tenants.insertOne({`);
    console.log(`  _id: ObjectId("${tenantId}"),`);
    console.log(`  name: "System",`);
    console.log(`  planId: "enterprise",`);
    console.log(`  status: "ACTIVE",`);
    console.log(`  settings: {},`);
    console.log(`  createdAt: ISODate("${now}"),`);
    console.log(`  updatedAt: ISODate("${now}")`);
    console.log(`});`);
    console.log('');

    console.log(`// 2. Create Super Admin User`);
    console.log(`db.users.insertOne({`);
    console.log(`  _id: ObjectId("${userId}"),`);
    console.log(`  tenantId: ObjectId("${tenantId}"),`);
    console.log(`  email: "admin@businessapp.com",`);
    console.log(`  passwordHash: "${hash}",`);
    console.log(`  role: "SUPER_ADMIN",`);
    console.log(`  profile: {`);
    console.log(`    firstName: "Super",`);
    console.log(`    lastName: "Admin"`);
    console.log(`  },`);
    console.log(`  isActive: true,`);
    console.log(`  createdAt: ISODate("${now}"),`);
    console.log(`  updatedAt: ISODate("${now}")`);
    console.log(`});`);
}

generate();
