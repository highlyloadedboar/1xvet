--liquibase formatted sql

--changeset xvet:007-create-vet-slots
CREATE TABLE vet_slots (
    id          BIGSERIAL       PRIMARY KEY,
    vet_id      BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time  TIMESTAMPTZ     NOT NULL,
    booked      BOOLEAN         NOT NULL DEFAULT false,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    UNIQUE (vet_id, start_time)
);

CREATE INDEX idx_vet_slots_vet_id_start_time ON vet_slots (vet_id, start_time);
--rollback DROP TABLE vet_slots;
