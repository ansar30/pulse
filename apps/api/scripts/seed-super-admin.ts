import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

// Load env from root manually
const envPath = path.join(__dirname, '../../../.env');
console.log('Looking for .env at:', envPath);
if (fs.existsSync(envPath)) {
    console.log('.env file found');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
} else {
    console.log('.env file NOT found');
}

const prisma = new PrismaClient();

async function seedSuperAdmin() {
    console.log('🌱 Seeding super admin...');

    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@businessapp.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin123!';

    // Upsert system tenant
    const systemTenant = await prisma.tenant.upsert({
        where: { id: 'system' }, // Assuming we can use a fixed ID or find by name if unique constraint exists. 
        // However, schema doesn't show unique name. Let's try to find by name first or just create if not exists.
        // Actually, for safety, let's look it up or create it. 
        // But upsert requires a unique field. The schema has `id` as @id. 
        // Let's try to find a tenant with planId 'enterprise' and name 'System' or just create one.
        // Better approach for script: Find first, if not create.
        create: {
            name: 'System',
            planId: 'enterprise',
            status: 'ACTIVE',
        },
        update: {
            planId: 'enterprise',
            status: 'ACTIVE',
        },
    });

    // Wait, `upsert` needs a unique where clause. `id` is auto generated usually but we can't predict it.
    // Let's change strategy: Find by name 'System' (assuming it's unique enough for seed) or just create.
    // But to be robust, let's check if we can find the user first, and use their tenant if it exists.

    let tenantId;

    // Check if user exists to get their tenant
    const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });

    if (existingUser) {
        tenantId = existingUser.tenantId;
        console.log('Found existing user, using tenant:', tenantId);

        // Update tenant to be sure
        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: 'System',
                planId: 'enterprise',
                status: 'ACTIVE',
            }
        });
    } else {
        // Create new tenant
        const newTenant = await prisma.tenant.create({
            data: {
                name: 'System',
                planId: 'enterprise',
                status: 'ACTIVE',
            },
        });
        tenantId = newTenant.id;
        console.log('Created new System tenant:', tenantId);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Upsert user
    const superAdmin = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
            tenantId, // Ensure they are linked to the correct tenant
            profile: {
                firstName: 'Super',
                lastName: 'Admin',
            },
        },
        create: {
            email,
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
            tenantId,
            profile: {
                firstName: 'Super',
                lastName: 'Admin',
            },
        },
    });

    console.log('✅ Super admin seeded successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 User ID: ${superAdmin.id}`);
    console.log(`🏢 Tenant ID: ${tenantId}`);
}

seedSuperAdmin()
    .catch((e) => {
        console.error('❌ Error seeding super admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
