--liquibase formatted sql

--changeset xvet:008-create-appointments
CREATE TYPE appointment_status AS ENUM ('BOOKED', 'CANCELLED');

CREATE TABLE appointments (
    id          BIGSERIAL           PRIMARY KEY,
    slot_id     BIGINT              NOT NULL REFERENCES vet_slots(id) ON DELETE CASCADE,
    owner_id    BIGINT              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pet_id      BIGINT              REFERENCES pets(id) ON DELETE SET NULL,
    reason      TEXT,
    status      appointment_status  NOT NULL DEFAULT 'BOOKED',
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_appointments_active_slot
    ON appointments (slot_id)
    WHERE status = 'BOOKED';

CREATE INDEX idx_appointments_owner_id ON appointments (owner_id);
CREATE INDEX idx_appointments_slot_id ON appointments (slot_id);

--rollback DROP TABLE appointments;
--rollback DROP TYPE appointment_status;
