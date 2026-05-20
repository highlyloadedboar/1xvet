--liquibase formatted sql

--changeset xvet:004-create-vet-profiles
CREATE TABLE vet_profiles (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty       VARCHAR(100)    NOT NULL,
    experience_years INT            NOT NULL DEFAULT 0,
    description     TEXT,
    education       VARCHAR(255),
    price_rub       INT,
    available       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vet_profiles_user_id ON vet_profiles (user_id);
CREATE INDEX idx_vet_profiles_specialty ON vet_profiles (specialty);
CREATE INDEX idx_vet_profiles_available ON vet_profiles (available);
--rollback DROP TABLE vet_profiles;
