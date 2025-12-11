import Database from 'better-sqlite3';
import path from 'path';

// Use absolute path for the database file
const dbPath = path.join(process.cwd(), 'ims.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    accountId INTEGER PRIMARY KEY,
    principalPersonId INTEGER,
    spousePersonId INTEGER,
    accountNumber TEXT UNIQUE,
    status TEXT CHECK(status IN ('active', 'inactive')),
    clientName TEXT,
    accessLevelId INTEGER,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS zkteco_persons (
    PersonID INTEGER PRIMARY KEY,
    Name TEXT,
    Gender TEXT,
    DepartmentID INTEGER,
    CardNo TEXT,
    cachedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS zkteco_access_levels (
    LevelID INTEGER PRIMARY KEY,
    Name TEXT,
    Description TEXT,
    cachedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS zkteco_doors (
    DoorID INTEGER PRIMARY KEY,
    Name TEXT,
    cachedAt TEXT
  );
`);

export default db;