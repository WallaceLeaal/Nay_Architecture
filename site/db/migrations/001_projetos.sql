CREATE TABLE IF NOT EXISTS projetos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  status ENUM('rascunho', 'publicado') NOT NULL DEFAULT 'rascunho',
  ordem INT UNSIGNED NOT NULL DEFAULT 0,
  criado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  publicado_em DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_projetos_slug (slug),
  KEY idx_projetos_status_ordem (status, ordem, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS imagens_do_projeto (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  projeto_id INT UNSIGNED NOT NULL,
  caminho VARCHAR(2048) NOT NULL,
  texto_alternativo VARCHAR(255) NOT NULL,
  tipo ENUM('capa', 'galeria') NOT NULL DEFAULT 'galeria',
  ordem INT UNSIGNED NOT NULL DEFAULT 0,
  criado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  projeto_com_capa INT UNSIGNED GENERATED ALWAYS AS (
    CASE WHEN tipo = 'capa' THEN projeto_id ELSE NULL END
  ) VIRTUAL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_imagens_uma_capa_por_projeto (projeto_com_capa),
  KEY idx_imagens_projeto_tipo_ordem (projeto_id, tipo, ordem, id),
  CONSTRAINT fk_imagens_projeto
    FOREIGN KEY (projeto_id) REFERENCES projetos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
