"""
Reconcile credit transactions with attendance records.
This script finds discrepancies and creates adjustment transactions to fix them.

Run with: python -m backend.migrations.reconcile_credits
"""
from sqlalchemy import text
from ..database import engine
import uuid


def reconcile_credits():
    with engine.begin() as conn:
        print("=== Credit Reconciliation Script ===\n")

        # Get expected credits deducted based on PRESENT attendance records
        # Grouped by student_id and enrollment_id
        expected_query = text("""
            SELECT
                ar.student_id,
                e.id as enrollment_id,
                COUNT(*) as present_count,
                SUM(c.duration / 60.0) as expected_credits
            FROM attendance_records ar
            JOIN classes c ON ar.class_id = c.id
            JOIN enrollments e ON e.student_id = ar.student_id
                AND e.teacher_id = c.teacher_id
                AND e.instrument_id = c.instrument_id
            WHERE ar.status = 'PRESENT'
            GROUP BY ar.student_id, e.id
        """)
        expected_results = conn.execute(expected_query).fetchall()

        # Get actual credits deducted from transactions
        # Only count DEDUCTION type (negative credits)
        actual_query = text("""
            SELECT
                student_id,
                enrollment_id,
                COUNT(*) as deduction_count,
                ABS(SUM(credits)) as actual_credits
            FROM credit_transactions
            WHERE type = 'DEDUCTION'
            GROUP BY student_id, enrollment_id
        """)
        actual_results = conn.execute(actual_query).fetchall()

        # Build lookup maps
        expected_map = {}
        for row in expected_results:
            key = (row.student_id, row.enrollment_id)
            expected_map[key] = float(row.expected_credits)

        actual_map = {}
        for row in actual_results:
            key = (row.student_id, row.enrollment_id)
            actual_map[key] = float(row.actual_credits)

        # Find all unique student/enrollment combinations
        all_keys = set(expected_map.keys()) | set(actual_map.keys())

        adjustments_needed = []

        print("Analyzing discrepancies...\n")
        print(f"{'Student':<12} {'Enrollment':<15} {'Expected':<10} {'Actual':<10} {'Adjustment':<12}")
        print("-" * 60)

        for key in sorted(all_keys):
            student_id, enrollment_id = key
            expected = expected_map.get(key, 0.0)
            actual = actual_map.get(key, 0.0)

            if abs(expected - actual) > 0.001:  # Float comparison tolerance
                adjustment = actual - expected  # Positive = over-deducted, need refund
                adjustments_needed.append({
                    'student_id': student_id,
                    'enrollment_id': enrollment_id,
                    'expected': expected,
                    'actual': actual,
                    'adjustment': adjustment
                })
                print(f"{student_id:<12} {enrollment_id:<15} {expected:<10.2f} {actual:<10.2f} {adjustment:+.2f}")

        if not adjustments_needed:
            print("\nNo discrepancies found. Credits are in sync.")
            return

        print(f"\nFound {len(adjustments_needed)} discrepancies.")

        # Create adjustment transactions
        print("\nCreating adjustment transactions...")

        for adj in adjustments_needed:
            tx_id = f"trx-{uuid.uuid4().hex[:8]}"

            # Positive adjustment = credits were over-deducted, restore them
            # Negative adjustment = credits were under-deducted, deduct more
            credits = adj['adjustment']
            tx_type = 'ADJUSTMENT'

            if adj['enrollment_id']:
                note = f"Reconciliation: expected {adj['expected']:.2f} deducted, actual {adj['actual']:.2f}"

                insert_query = text("""
                    INSERT INTO credit_transactions
                    (id, student_id, enrollment_id, credits, type, amount, note, date)
                    VALUES (:id, :student_id, :enrollment_id, :credits, :type, 0, :note, NOW())
                """)

                conn.execute(insert_query, {
                    'id': tx_id,
                    'student_id': adj['student_id'],
                    'enrollment_id': adj['enrollment_id'],
                    'credits': credits,
                    'type': tx_type,
                    'note': note
                })

                action = "refunded" if credits > 0 else "deducted"
                print(f"  {adj['student_id']}: {action} {abs(credits):.2f} credits ({tx_id})")

        print("\nReconciliation complete!")


if __name__ == "__main__":
    reconcile_credits()
