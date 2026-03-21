"""
Add duration column to attendance_records and populate from class records.

Run with: python -m backend.migrations.add_attendance_duration
"""
from sqlalchemy import text
from ..database import engine


def add_attendance_duration():
    with engine.begin() as conn:
        print("=== Add Duration to Attendance Records ===\n")

        # Add duration column if it doesn't exist
        try:
            conn.execute(text("""
                ALTER TABLE attendance_records
                ADD COLUMN duration INTEGER
            """))
            print("Added duration column to attendance_records")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Duration column already exists")
            else:
                print(f"Note: {e}")

        # Count records with NULL duration
        result = conn.execute(text("""
            SELECT COUNT(*) FROM attendance_records WHERE duration IS NULL
        """))
        null_count = result.scalar()
        print(f"Records with NULL duration: {null_count}")

        if null_count > 0:
            # Update duration from class records
            conn.execute(text("""
                UPDATE attendance_records ar
                SET duration = c.duration
                FROM classes c
                WHERE ar.class_id = c.id
                AND ar.duration IS NULL
            """))
            print(f"Updated {null_count} records with duration from class")

        # Verify
        result = conn.execute(text("""
            SELECT ar.id, ar.duration, c.duration as class_duration
            FROM attendance_records ar
            JOIN classes c ON ar.class_id = c.id
            LIMIT 10
        """))
        print("\nSample records:")
        print(f"{'ID':<15} {'Duration':<10} {'Class Duration':<15}")
        print("-" * 40)
        for row in result:
            print(f"{row.id:<15} {row.duration or 'NULL':<10} {row.class_duration:<15}")

        print("\nDone!")


if __name__ == "__main__":
    add_attendance_duration()
