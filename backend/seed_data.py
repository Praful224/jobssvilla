import sys
import os

# Add parent directory to path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.job import Job
from app.services.auth_service import hash_password

def seed_database():
    db = SessionLocal()
    try:
        # Ensure all tables are created
        print("▶ Creating database schemas if not exist...", flush=True)
        Base.metadata.create_all(bind=engine)
        
        # --- 1. SEEDING DEMO USERS ---
        print("\n▶ Seeding demo users...", flush=True)
        demo_users = [
            {
                "name": "Praful Kumar",
                "email": "praful@gmail.com",
                "role": "student",
                "password": "123456"
            },
            {
                "name": "Sarah Recruiter",
                "email": "recruiter@jobsvilla.com",
                "role": "recruiter",
                "password": "123456"
            },
            {
                "name": "Alex Mentor",
                "email": "mentor@jobsvilla.com",
                "role": "mentor",
                "password": "123456"
            }
        ]
        
        for u_data in demo_users:
            user = db.query(User).filter(User.email == u_data["email"]).first()
            if not user:
                print(f"  + Creating {u_data['role']} user '{u_data['email']}'...", flush=True)
                new_user = User(
                    name=u_data["name"],
                    email=u_data["email"],
                    password=hash_password(u_data["password"]),
                    role=u_data["role"]
                )
                db.add(new_user)
            else:
                print(f"  o User '{u_data['email']}' already exists.", flush=True)
                # Ensure the password is correct (reset to 123456)
                user.password = hash_password(u_data["password"])
                user.role = u_data["role"]
                user.name = u_data["name"]
        
        db.commit()
        print("✓ Users seeding completed!", flush=True)
        
        # --- 2. SEEDING RICH JOB POSTINGS ---
        print("\n▶ Seeding job postings...", flush=True)
        
        # We clear the existing job postings first to avoid accumulation of duplicates on repeat seeds
        print("  - Clearing previous job postings...", flush=True)
        db.query(Job).delete()
        db.commit()
        
        jobs_to_seed = [
            {
                "company": "Amazon Web Services (AWS)",
                "role": "Cloud Security Engineer",
                "location": "Bangalore, India (Hybrid)",
                "salary": "₹18,000,000 - ₹2,500,000 INR",
                "skills": "AWS, EC2, IAM, Terraform, VPC, Docker, Kubernetes, Linux, Security",
                "apply_link": "https://aws.amazon.com/careers",
                "description": (
                    "Join our core Cloud Defense group in Bangalore to build sandboxed containerization layers, "
                    "secure VPC routing grids, and design least-privilege IAM matrices. You will deploy "
                    "Terraform-based compliance control pipelines and run container security scanning."
                ),
                "created_by": "recruiter@jobsvilla.com"
            },
            {
                "company": "JobsVilla Inc.",
                "role": "Backend Engineering Fellow",
                "location": "Remote (Asia/Europe)",
                "salary": "₹1,200,000 - ₹1,500,000 INR",
                "skills": "Python, FastAPI, SQL, Docker, CI/CD, Git",
                "apply_link": "https://jobsvilla.com/fellowships",
                "description": (
                    "Help JobsVilla build the future of career networking! As a Backend Engineering Fellow, "
                    "you will spearhead asynchronous FastAPI microservices, containerize multi-service grids "
                    "using Docker, and verify cryptographic claims in our SQLite databases."
                ),
                "created_by": "recruiter@jobsvilla.com"
            },
            {
                "company": "HashiCorp",
                "role": "DevOps Architect",
                "location": "Remote (Global)",
                "salary": "₹3,000,000 - ₹4,500,000 INR",
                "skills": "Terraform, Kubernetes, Vault, CI/CD, Go, Linux, Monitoring",
                "apply_link": "https://hashicorp.com/careers",
                "description": (
                    "Scale the HashiStack across multi-cloud environments. You will design and build "
                    "large-scale infrastructure pipelines using Terraform, maintain high-availability Kubernetes "
                    "runtime orchestrators, and secure credential storage setups using HashiCorp Vault."
                ),
                "created_by": "recruiter@jobsvilla.com"
            },
            {
                "company": "Vercel",
                "role": "Frontend Developer (React/NextJS)",
                "location": "Bangalore, India (Hybrid)",
                "salary": "₹2,000,000 - ₹3,000,000 INR",
                "skills": "React, Next.js, TypeScript, TailwindCSS, CSS, HTML",
                "apply_link": "https://vercel.com/careers",
                "description": (
                    "Build premium, state-of-the-art web applications that deliver instant loading times "
                    "and look beautiful. You will craft gorgeous, fluid user interfaces using React, Next.js, "
                    "and custom CSS styling, ensuring extremely fast page load speeds and pixel-perfect layouts."
                ),
                "created_by": "recruiter@jobsvilla.com"
            },
            {
                "company": "Ethereum Foundation",
                "role": "Cryptography Software Engineer",
                "location": "Remote (Decentralized)",
                "salary": "₹4,000,000 - ₹6,000,000 INR",
                "skills": "Rust, Cryptography, SQL, Go, Docker",
                "apply_link": "https://ethereum.org/careers",
                "description": (
                    "Work on the cutting edge of zero-knowledge proofs and secure signature schemes. "
                    "You will build high-performance cryptography modules in Rust, design Ed25519 profile "
                    "claim verifiers, and maintain private containerized compilation networks."
                ),
                "created_by": "recruiter@jobsvilla.com"
            }
        ]
        
        for j_data in jobs_to_seed:
            print(f"  + Inserting job posting: '{j_data['role']}' at '{j_data['company']}'...", flush=True)
            new_job = Job(
                company=j_data["company"],
                role=j_data["role"],
                location=j_data["location"],
                salary=j_data["salary"],
                skills=j_data["skills"],
                apply_link=j_data["apply_link"],
                description=j_data["description"],
                created_by=j_data["created_by"]
            )
            db.add(new_job)
            
        db.commit()
        print("✓ Job postings seeding completed successfully!", flush=True)
        print("\n🌟 Database successfully seeded with 3 demo users and 5 premium job postings! 🌟", flush=True)
        
    except Exception as e:
        print(f"✗ Error during database seeding: {e}", flush=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
