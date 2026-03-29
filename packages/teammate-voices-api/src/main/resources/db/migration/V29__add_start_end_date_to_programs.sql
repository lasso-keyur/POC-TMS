-- V29: Add start_date and end_date to PROGRAMS table
ALTER TABLE PROGRAMS ADD (
    start_date DATE,
    end_date   DATE
);
