--liquibase formatted sql

--changeset xvet:003-create-pets
CREATE TYPE pet_species AS ENUM ('DOG', 'CAT', 'BIRD', 'RODENT', 'REPTILE', 'OTHER');

CREATE TABLE pets (
    id          BIGSERIAL       PRIMARY KEY,
    owner_id    BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100)    NOT NULL,
    species     pet_species     NOT NULL,
    breed       VARCHAR(100),
    birth_date  DATE,
    weight      DOUBLE PRECISION,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pets_owner_id ON pets (owner_id);
--rollback DROP TABLE pets;
--rollback DROP TYPE pet_species;
