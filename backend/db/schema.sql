-- Event Management System Database Schema
-- Simplified version: Single event table + reference tables for dropdowns only

-- Drop existing tables if they exist (reverse order due to foreign keys)
IF OBJECT_ID('audit_log', 'U') IS NOT NULL DROP TABLE audit_log;
IF OBJECT_ID('uzm_event', 'U') IS NOT NULL DROP TABLE uzm_event;
IF OBJECT_ID('uzm_businesscard', 'U') IS NOT NULL DROP TABLE uzm_businesscard;
IF OBJECT_ID('uzm_salutationBase', 'U') IS NOT NULL DROP TABLE uzm_salutationBase;
IF OBJECT_ID('uzm_budgetBase', 'U') IS NOT NULL DROP TABLE uzm_budgetBase;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;

-- Users Table (Authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(100) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(200),
    created_date DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Budget Reference Table
CREATE TABLE uzm_budgetBase (
    uzm_budgetId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    uzm_name NVARCHAR(200) NOT NULL,
    created_date DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Salutation (Message) Reference Table
CREATE TABLE uzm_salutationBase (
    uzm_salutationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    uzm_name NVARCHAR(500) NOT NULL,
    created_date DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Business Card Reference Table
CREATE TABLE uzm_businesscard (
    uzm_businesscardId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    uzm_name NVARCHAR(200) NOT NULL,
    created_date DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Event Table (Main table - All free-text fields included)
CREATE TABLE uzm_event (
    uzm_eventId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    -- Legacy/Reference fields (for old records)
    uzm_contactid NVARCHAR(100), -- Reference to old Contact system
    uzm_addresstype INT DEFAULT 3, -- 1=Address1, 2=Address2, 3=Custom

    -- Foreign Keys (Dropdown references only)
    uzm_budgetid UNIQUEIDENTIFIER NOT NULL,
    uzm_salutationid UNIQUEIDENTIFIER,
    uzm_BusinessCard1 UNIQUEIDENTIFIER,
    uzm_BusinessCard2 UNIQUEIDENTIFIER,
    uzm_BusinessCard3 UNIQUEIDENTIFIER,
    uzm_BusinessCard4 UNIQUEIDENTIFIER,
    uzm_BusinessCard5 UNIQUEIDENTIFIER,

    -- Gönderim Türü
    uzm_nationality INT NOT NULL DEFAULT 1, -- 1=YURTİÇİ, 2=YURTDIŞI

    -- Adres Bilgileri (Free-text)
    uzm_adress NVARCHAR(500),
    uzm_CountryidName NVARCHAR(100), -- ULKE
    uzm_city NVARCHAR(100), -- ŞEHİR
    uzm_county NVARCHAR(100), -- İLÇE
    uzm_businessstate NVARCHAR(100), -- SEMT
    uzm_zippostalcode NVARCHAR(20), -- POSTA KODU

    -- Kişi Bilgileri (Free-text)
    FirstName NVARCHAR(100), -- AD
    LastName NVARCHAR(100), -- SOYAD
    Company NVARCHAR(200), -- ŞİRKET
    JobTitle NVARCHAR(150), -- ÜNVAN

    -- System fields
    uzm_eventtypeid UNIQUEIDENTIFIER DEFAULT 'C89A605F-7F52-F011-8BAA-005056A1F1F4',
    statecode INT DEFAULT 0, -- 0=Active, 1=Inactive
    created_date DATETIME DEFAULT GETDATE(),
    created_by NVARCHAR(100),
    is_modified BIT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    modified_date DATETIME,
    modified_by NVARCHAR(100),

    -- Foreign Key Constraints
    FOREIGN KEY (uzm_budgetid) REFERENCES uzm_budgetBase(uzm_budgetId),
    FOREIGN KEY (uzm_salutationid) REFERENCES uzm_salutationBase(uzm_salutationId),
    FOREIGN KEY (uzm_BusinessCard1) REFERENCES uzm_businesscard(uzm_businesscardId),
    FOREIGN KEY (uzm_BusinessCard2) REFERENCES uzm_businesscard(uzm_businesscardId),
    FOREIGN KEY (uzm_BusinessCard3) REFERENCES uzm_businesscard(uzm_businesscardId),
    FOREIGN KEY (uzm_BusinessCard4) REFERENCES uzm_businesscard(uzm_businesscardId),
    FOREIGN KEY (uzm_BusinessCard5) REFERENCES uzm_businesscard(uzm_businesscardId)
);

-- Audit Log Table
CREATE TABLE audit_log (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    table_name NVARCHAR(100),
    record_id NVARCHAR(100),
    field_name NVARCHAR(100),
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    action_type NVARCHAR(50), -- INSERT, UPDATE, DELETE
    action_date DATETIME DEFAULT GETDATE(),
    action_by NVARCHAR(100)
);

-- Create Indexes for better performance
CREATE INDEX idx_event_budgetid ON uzm_event(uzm_budgetid);
CREATE INDEX idx_event_salutationid ON uzm_event(uzm_salutationid);
CREATE INDEX idx_event_statecode ON uzm_event(statecode);
CREATE INDEX idx_event_eventtypeid ON uzm_event(uzm_eventtypeid);
CREATE INDEX idx_event_firstname ON uzm_event(FirstName);
CREATE INDEX idx_event_lastname ON uzm_event(LastName);
CREATE INDEX idx_event_company ON uzm_event(Company);
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_date ON audit_log(action_date DESC);

PRINT '✅ Simplified database schema created successfully';
PRINT '📋 Tables: users, uzm_budgetBase, uzm_salutationBase, uzm_businesscard, uzm_event, audit_log';
PRINT '✅ Contact table removed - all fields moved to uzm_event';
