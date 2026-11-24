CREATE TABLE IF NOT EXISTS admin_sessoes (
  token_hash BINARY(32) NOT NULL,
  expira_em DATETIME NOT NULL,
  PRIMARY KEY (token_hash),
  KEY idx_admin_sessoes_expiracao (expira_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_tentativas (
  janela BIGINT UNSIGNED NOT NULL,
  total SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (janela)
) ENGINE=InnoDB;
