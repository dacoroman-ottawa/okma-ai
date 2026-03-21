# Data Model

## Entities

### Teacher
An instructor who teaches lessons and has availability slots. Each teacher can teach one or more instruments.

### Student
A learner who enrolls in classes and has a credit balance. Students can study multiple instruments, each with a different teacher.

### Instrument
A musical instrument that can be taught (piano, guitar, violin, drums, etc.).

### Enrollment
A student's ongoing study of a specific instrument with a specific teacher. Represents the relationship between a student, teacher, and instrument.

### Class
A scheduled lesson (private or group) for an enrollment. Represents a specific date and time when instruction occurs.

### Product
An item in inventory (instrument, accessory, book, apparel, etc.) that can be rented or sold.

### Rental
A record of a product being rented to a customer, including rental period and return status.

### Sale
A record of a product being sold to a customer.

### CreditTransaction
A record of credits being purchased or deducted from a student's balance.

### AppUser
A system login account with name, email, admin privileges, and active status.

## Relationships

- Teacher teaches one or more Instruments
- Student has many Enrollments (one per instrument they're learning)
- Enrollment links one Student, one Teacher, and one Instrument
- Class belongs to one Enrollment (or multiple Enrollments for group classes)
- Product has many Rentals and Sales
- Student has many Rentals, Sales, and CreditTransactions
- CreditTransaction belongs to one Student
- AppUser is separate from Teacher/Student — represents system login accounts

## Notes

- TypeScript interfaces for each entity are in `types.ts`
- Sample data is in `sample-data.json`
- Each section may extend these base types with section-specific fields
