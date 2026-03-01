"""
Fix existing attendance records to have correct credits values.
Run with: python -m backend.migrations.fix_credits_data
"""
from sqlalchemy import text
from ..database import engine


def fix_data():
    with engine.begin() as conn:
        # Count records
        result = conn.execute(text("SELECT COUNT(*) FROM attendance_records"))
        total = result.scalar()
        print(f"Total attendance records: {total}")

        # Check records with NULL credits
        result = conn.execute(text("SELECT COUNT(*) FROM attendance_records WHERE credits IS NULL"))
        null_credits = result.scalar()
        print(f"Records with NULL credits: {null_credits}")

        if null_credits > 0:
            # Update NULL credits to 0
            conn.execute(text("UPDATE attendance_records SET credits = 0 WHERE credits IS NULL"))
            print(f"Updated {null_credits} records with NULL credits to 0")

        # Update present status to have credits = -1
        result = conn.execute(text("""
            SELECT COUNT(*) FROM attendance_records
            WHERE status = 'PRESENT' AND credits != -1
        """))
        wrong_present = result.scalar()
        print(f"Present records with wrong credits: {wrong_present}")

        if wrong_present > 0:
            conn.execute(text("""
                UPDATE attendance_records SET credits = -1 WHERE status = 'PRESENT'
            """))
            print(f"Fixed {wrong_present} present records to have credits = -1")

        # Update non-present status to have credits = 0
        result = conn.execute(text("""
            SELECT COUNT(*) FROM attendance_records
            WHERE status != 'PRESENT' AND credits != 0
        """))
        wrong_other = result.scalar()
        print(f"Non-present records with wrong credits: {wrong_other}")

        if wrong_other > 0:
            conn.execute(text("""
                UPDATE attendance_records SET credits = 0 WHERE status != 'PRESENT'
            """))
            print(f"Fixed {wrong_other} non-present records to have credits = 0")

        print("Done!")


if __name__ == "__main__":
    fix_data()
