-- Grant permissions to ARYA user (user is auto-created by gvenzl/oracle-free APP_USER env var)
-- These scripts run as SYSTEM in FREEPDB1

-- Grant additional privileges
GRANT CONNECT, RESOURCE TO ARYA;
GRANT UNLIMITED TABLESPACE TO ARYA;

-- Set schema for subsequent operations
ALTER SESSION SET CURRENT_SCHEMA = ARYA;
