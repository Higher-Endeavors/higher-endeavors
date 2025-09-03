-- 1. Parent lookup table: activity families
CREATE TABLE cme_activity_family (
  cme_activity_family_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity_family_name    VARCHAR(25)                      NOT NULL
);

-- 2. Main library table, with two foreign keys
CREATE TABLE cme_activity_library (
  cme_activity_library_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity                VARCHAR(50)                      NOT NULL,
  activity_family         INTEGER                  NOT NULL
    REFERENCES cme_activity_family(cme_activity_family_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
);

ALTER TABLE cme_activity_library ADD COLUMN keywords TEXT[];

-- 3. Equipment lookup table
CREATE TABLE cme_equipment (
  cme_equipment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  equipment_name VARCHAR(25) NOT NULL
);