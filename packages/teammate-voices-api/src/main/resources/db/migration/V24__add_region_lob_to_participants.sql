-- V24: Add region and line_of_business to PARTICIPANTS for audience-based logic rules
ALTER TABLE PARTICIPANTS ADD (
    REGION VARCHAR2(100),
    LINE_OF_BUSINESS VARCHAR2(100)
);

-- Back-fill sample data for existing seeded participants so rules can be tested
UPDATE PARTICIPANTS SET REGION = 'North America', LINE_OF_BUSINESS = 'Retail Banking'
WHERE ROWNUM <= 5 AND REGION IS NULL;

UPDATE PARTICIPANTS SET REGION = 'APAC', LINE_OF_BUSINESS = 'Corporate Banking'
WHERE ROWNUM <= 5 AND REGION IS NULL;

UPDATE PARTICIPANTS SET REGION = 'EMEA', LINE_OF_BUSINESS = 'Wealth Management'
WHERE REGION IS NULL;

COMMIT;
