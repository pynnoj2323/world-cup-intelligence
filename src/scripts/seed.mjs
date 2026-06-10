// 种子脚本：创建默认管理员账号
// 运行方式: node src/scripts/seed.mjs
// 默认管理员: admin@worldcup.com / admin123

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ 请设置 DATABASE_URL 环境变量");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const adminEmail = "admin@worldcup.com";
const adminPassword = "admin123";

async function main() {
  // Check if admin exists
  const rows = await sql`SELECT * FROM "User" WHERE email = ${adminEmail}`;

  if (rows.length > 0) {
    console.log(`✅ 管理员账号已存在: ${adminEmail}`);
    if (rows[0].role !== "admin") {
      await sql`UPDATE "User" SET role = 'admin' WHERE email = ${adminEmail}`;
      console.log("✅ 已更新为管理员角色");
    }
  } else {
    const hashedPassword = bcrypt.hashSync(adminPassword, 12);
    const id = randomUUID();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
      VALUES (${id}, ${adminEmail}, ${hashedPassword}, ${'管理员'}, ${'admin'}, ${now}, ${now})
    `;

    console.log(`✅ 管理员账号已创建:`);
    console.log(`   邮箱: ${adminEmail}`);
    console.log(`   密码: ${adminPassword}`);
  }

  console.log("\n🎉 种子数据准备完成！");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ 种子脚本执行失败:", e);
  process.exit(1);
});
