import sqlite3

def check_db():
    conn = sqlite3.connect("jobsvilla.db")
    c = conn.cursor()
    try:
        c.execute("SELECT name, email, password FROM users")
        users = c.fetchall()
        print("USERS FOUND:", users)
    except Exception as e:
        print("ERROR:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    check_db()
