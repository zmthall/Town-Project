import { db } from "../utils/db";

async function run() {
  const email = "admin@townproject.com";
  const name = "Zack Admin";
  const plainPassword = "ChangeMe123!";

  const existingUser = await db.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (existingUser.rows.length > 0) {
    console.log(`Admin user already exists for ${email}`);
    process.exit(0);
  }

  const passwordHash = await hashPassword(plainPassword);

  const result = await db.query(
    `
      INSERT INTO users (email, name, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, is_active, created_at
    `,
    [email, name, passwordHash, "admin", true]
  );

  console.log("Admin user created:");
  console.log(result.rows[0]);

  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to seed admin user:", error);
  process.exit(1);
});
