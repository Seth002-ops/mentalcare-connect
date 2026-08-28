import sqlite3

conn = sqlite3.connect('afya_care.db')
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='session_notes'")
if not cur.fetchone():
    print("❌ session_notes table not found")
else:
    cur.execute("PRAGMA table_info(session_notes)")
    cols = [row[1] for row in cur.fetchall()]
    added = []
    if 'treatment_approach' not in cols:
        cur.execute("ALTER TABLE session_notes ADD COLUMN treatment_approach VARCHAR")
        added.append('treatment_approach')
    if 'techniques_used' not in cols:
        cur.execute("ALTER TABLE session_notes ADD COLUMN techniques_used TEXT")
        added.append('techniques_used')
    conn.commit()
    print(f"✅ Added columns: {', '.join(added)}" if added else "✅ Columns already exist")

conn.close()