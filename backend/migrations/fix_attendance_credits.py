"""
Fix attendance record credits to be scaled by class duration.
Previously credits were always -1 for present, now they should be -(duration/60).

Run with: python -m backend.migrations.fix_attendance_credits
"""
from sqlalchemy import text
from ..database import engine


def fix_attendance_credits():
    with engine.begin() as conn:
        print("=== Fix Attendance Record Credits ===\n")

        # First, alter the column type from integer to float (if needed)
        # PostgreSQL allows this conversion
        try:
            conn.execute(text("""
                ALTER TABLE attendance_records
                ALTER COLUMN credits TYPE DOUBLE PRECISION
            """))
            print("Column type changed to DOUBLE PRECISION")
        except Exception as e:
            print(f"Column type already correct or error: {e}")

        # Get all PRESENT attendance records with their class durations
        query = text("""
            SELECT
                ar.id,
                ar.credits as current_credits,
                c.duration,
                -(c.duration / 60.0) as correct_credits
            FROM attendance_records ar
            JOIN classes c ON ar.class_id = c.id
            WHERE ar.status = 'PRESENT'
        """)
        records = conn.execute(query).fetchall()

        print(f"Found {len(records)} PRESENT attendance records\n")

        updates_needed = []
        for record in records:
            current = float(record.current_credits) if record.current_credits else 0
            correct = float(record.correct_credits)
            if abs(current - correct) > 0.001:
                updates_needed.append({
                    'id': record.id,
                    'current': current,
                    'correct': correct,
                    'duration': record.duration
                })

        if not updates_needed:
            print("All attendance record credits are correct. No updates needed.")
            return

        print(f"{'ID':<15} {'Duration':<10} {'Current':<10} {'Correct':<10}")
        print("-" * 45)
        for u in updates_needed:
            print(f"{u['id']:<15} {u['duration']:<10} {u['current']:<10.2f} {u['correct']:<10.2f}")

        print(f"\nUpdating {len(updates_needed)} records...")

        # Update all PRESENT records to have correct credits based on duration
        update_query = text("""
            UPDATE attendance_records ar
            SET credits = -(c.duration / 60.0)
            FROM classes c
            WHERE ar.class_id = c.id
            AND ar.status = 'PRESENT'
        """)
        conn.execute(update_query)

        # Also ensure non-PRESENT records have credits = 0
        conn.execute(text("""
            UPDATE attendance_records
            SET credits = 0
            WHERE status != 'PRESENT' AND credits != 0
        """))

        print("\nDone! Attendance record credits are now scaled by class duration.")


if __name__ == "__main__":
    fix_attendance_credits()
