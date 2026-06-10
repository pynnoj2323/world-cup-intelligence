"""种子脚本：创建默认管理员账号
运行方式: python3 src/scripts/seed.py
默认管理员: admin@worldcup.com / admin123

使用 hashlib + scrypt 模拟 bcrypt 哈希（生产环境会使用 bcryptjs 从 Next.js 端处理）
"""

import sqlite3
import hashlib
import uuid
import binascii
from datetime import datetime, timezone

DB_PATH = "prisma/dev.db"
ADMIN_EMAIL = "admin@worldcup.com"
ADMIN_PASSWORD = "admin123"

def hash_password(password: str) -> str:
    """使用 Python hashlib 生成与 bcrypt 兼容的哈希。
    由于种子数据仅在开发环境使用，这里使用 pbkdf2 + base64 模拟。
    注意: 实际登录时 Auth.js 会使用 bcryptjs 验证。
    """
    salt = b"$2b$12$0000000000000000000000"  # dummy salt
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    # 返回 bcrypt 风格的占位哈希，实际值由 bcryptjs 生成
    return f"$2b$12${binascii.hexlify(dk).decode()[:53]}"

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    existing = cur.execute("SELECT * FROM User WHERE email = ?", (ADMIN_EMAIL,)).fetchone()

    if existing:
        print(f"✅ 管理员账号已存在: {ADMIN_EMAIL}")
        if existing["role"] != "admin":
            cur.execute("UPDATE User SET role = ? WHERE email = ?", ("admin", ADMIN_EMAIL))
            conn.commit()
            print("✅ 已更新为管理员角色")
    else:
        # 先用占位哈希，实际密码验证由 bcryptjs 处理
        hashed = hash_password(ADMIN_PASSWORD)
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

        cur.execute(
            "INSERT INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, ADMIN_EMAIL, hashed, "管理员", "admin", now, now)
        )
        conn.commit()
        print(f"✅ 管理员账号已创建 (占位哈希):")
        print(f"   邮箱: {ADMIN_EMAIL}")
        print(f"   密码: {ADMIN_PASSWORD}")
        print(f"   ⚠️  哈希为占位值，请在 Next.js 中通过注册接口重新设置密码")

    conn.close()
    print("\n🎉 种子数据准备完成！")

if __name__ == "__main__":
    main()
