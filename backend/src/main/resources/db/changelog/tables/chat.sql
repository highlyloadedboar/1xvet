--liquibase formatted sql

--changeset xvet:005-create-conversations
CREATE TABLE conversations (
    id          BIGSERIAL   PRIMARY KEY,
    owner_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vet_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (owner_id, vet_id)
);

CREATE INDEX idx_conversations_owner_id ON conversations (owner_id);
CREATE INDEX idx_conversations_vet_id ON conversations (vet_id);
CREATE INDEX idx_conversations_updated_at ON conversations (updated_at DESC);
--rollback DROP TABLE conversations;

--changeset xvet:006-create-messages
CREATE TABLE messages (
    id              BIGSERIAL   PRIMARY KEY,
    conversation_id BIGINT      NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id_created_at ON messages (conversation_id, created_at);
--rollback DROP TABLE messages;
