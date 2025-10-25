-- FEELGOOD Database User Creation Script
-- Run this script on 192.168.1.82 MSSQL Server

USE master;
GO

-- Create login if not exists
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'feelgood_user')
BEGIN
    CREATE LOGIN feelgood_user WITH PASSWORD = 'FeelGood@2024!Secure';
    PRINT 'Login created: feelgood_user';
END
ELSE
    PRINT 'Login already exists: feelgood_user';
GO

-- Switch to FEELGOOD database
USE FEELGOOD;
GO

-- Create user in FEELGOOD database
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'feelgood_user')
BEGIN
    CREATE USER feelgood_user FOR LOGIN feelgood_user;
    PRINT 'User created in FEELGOOD database';
END
ELSE
    PRINT 'User already exists in FEELGOOD database';
GO

-- Grant permissions (db_owner for full access to FEELGOOD only)
ALTER ROLE db_owner ADD MEMBER feelgood_user;
GO

PRINT 'User feelgood_user created successfully with db_owner permissions on FEELGOOD database';
PRINT 'Username: feelgood_user';
PRINT 'Password: FeelGood@2024!Secure';
GO
