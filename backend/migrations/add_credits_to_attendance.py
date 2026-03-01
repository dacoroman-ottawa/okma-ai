"""
Migration script to add credits column to attendance_records table.
Run with: python -m backend.migrations.add_credits_to_attendance
"""
from sqlalchemy import text
from ..database import engine


def migrate():
    with engine.begin() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'attendance_records' AND column_name = 'credits'
        """))

        if result.fetchone() is None:
            print("Adding 'credits' column to attendance_records table...")
            conn.execute(text("""
                ALTER TABLE attendance_records
                ADD COLUMN credits INTEGER DEFAULT 0
            """))
            print("Column added successfully!")

            # Update existing records: set credits to -1 for 'present' status
            print("Updating existing records...")
            conn.execute(text("""
                UPDATE attendance_records
                SET credits = -1
                WHERE status = 'present'
            """))
            print("Existing records updated!")
        else:
            print("Column 'credits' already exists, skipping migration.")


if __name__ == "__main__":
    migrate()
