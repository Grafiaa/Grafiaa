-- Sessões de login: o navegador guarda um código aleatório num cookie; aqui fica só a impressão digital dele.

CREATE TABLE sessoes (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id bigint NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  criado_em  timestamptz NOT NULL DEFAULT now(),
  expira_em  timestamptz NOT NULL
);

CREATE INDEX sessoes_usuario_id_idx ON sessoes (usuario_id);
