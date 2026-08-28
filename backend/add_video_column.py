import sqlite3

conn = sqlite3.connect('afya_care.db')
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cur.fetchall()]

target = None
for t in tables:
    if 'booking' in t.lower() and 'rage' not in t.lower():
        target = t
        break

if not target:
    print("❌ Could not find session bookings table. Tables:", tables)
else:
    cur.execute(f"PRAGMA table_info({target})")
    cols = [row[1] for row in cur.fetchall()]
    if 'video_room_id' in cols:
        print("✅ video_room_id already exists")
    else:
        cur.execute(f"ALTER TABLE {target} ADD COLUMN video_room_id VARCHAR")
        conn.commit()
        print(f"✅ Added video_room_id to {target}")

conn.close()