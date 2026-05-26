import sys
import os

# Add parent directory to path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database import SessionLocal, Base, engine
from app.models.user import User
from app.services.auth_service import hash_password

def setup_demo_user():
    db = SessionLocal()
    try:
        # Ensure tables are created
        Base.metadata.create_all(bind=engine)
        
        email = "praful@gmail.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print("Demo user not found. Creating user 'praful@gmail.com'...", flush=True)
            hashed = hash_password("123456")
            new_user = User(
                name="praful",
                email=email,
                password=hashed
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            print("Demo user created successfully!", flush=True)
        else:
            print("Demo user already exists in SQLite DB.", flush=True)
            # Ensure the password is correct
            from app.services.auth_service import verify_password
            if not verify_password("123456", user.password):
                print("Updating demo user password to '123456'...", flush=True)
                user.password = hash_password("123456")
                db.commit()
                print("Password updated successfully!", flush=True)
    except Exception as e:
        print(f"Error setting up demo user: {e}", flush=True)
    finally:
        db.close()

if __name__ == "__main__":
    setup_demo_user()
