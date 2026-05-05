# Diagrama do Banco de Dados

Este diagrama reflete a estrutura atual definida nas migrations do projeto, incluindo os schemas `public` e `auth`.

```mermaid
erDiagram
    PUBLIC_CITIES {
        text id PK
        text name
        text state
        numeric extensao_avaliada
        numeric ideciclo
        numeric vias_estruturais_km
        numeric vias_alimentadoras_km
        numeric vias_locais_km
        timestamptz created_at
        timestamptz updated_at
    }

    PUBLIC_SEGMENTS {
        text id PK
        text id_cidade FK
        text id_form
        segment_type type
        text name
        numeric length
        text neighborhood
        jsonb geometry
        boolean selected
        boolean evaluated
        boolean is_merged
        text parent_segment_id FK
        jsonb merged_segments
        text classification
        jsonb osm_advanced
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    PUBLIC_FORMS {
        text id PK
        text segment_id FK
        text city_id FK
        text researcher
        timestamptz date
        text street_name
        text neighborhood
        numeric extension
        text start_point
        text end_point
        text hierarchy
        text observations
        jsonb responses
        integer velocity
        integer blocks_count
        integer intersections_count
        timestamptz created_at
        timestamptz updated_at
    }

    PUBLIC_REVIEWS {
        text id PK
        text form_id FK
        rating_type rating_name
        integer rating
        numeric weight
        timestamptz created_at
    }

    PUBLIC_AVALIACOES_IDECICLO {
        uuid id PK
        text segment_id
        text pesquisador
        date data
        text cidade
        text bairro
        text nome_trecho
        numeric extensao
        integer velocidade_maxima
        text inicio_trecho
        text fim_trecho
        text hierarquia_viaria
        text tipologia
        text A1
        text A2
        text B1
        text B2
        text B3
        text B4
        text B5
        text B6
        text B7
        text C1
        text C2
        text C3
        text D1
        text D2
        text D3
        text E1
        text E2
        text E3
        text E4
        text observacoes
        timestamptz created_at
        timestamptz updated_at
    }

    PUBLIC_PONTUACOES_IDECICLO {
        uuid id PK
        uuid avaliacao_id FK
        text parametro
        text resposta
        numeric pontos
        text nome_parametro
        timestamptz created_at
    }

    PUBLIC_RESULTADOS_IDECICLO {
        uuid id PK
        uuid avaliacao_id FK
        text segment_id
        numeric nota_total
        text tipologia
        jsonb detalhes_calculo
        timestamptz created_at
    }

    AUTH_USERS {
        uuid id PK
        text email
        text name
        boolean active
        timestamptz created_at
    }

    AUTH_MAGIC_LINKS {
        uuid id PK
        text email
        text token_hash
        timestamptz expires_at
        timestamptz used_at
        timestamptz created_at
    }

    AUTH_SESSIONS {
        uuid id PK
        uuid user_id FK
        text session_hash
        timestamptz expires_at
        timestamptz revoked_at
        timestamptz created_at
    }

    AUTH_PERMISSIONS {
        uuid id PK
        uuid user_id FK
        text role
        text state
        text city
        text module
        timestamptz created_at
    }

    PUBLIC_CITIES ||--o{ PUBLIC_SEGMENTS : "has"
    PUBLIC_SEGMENTS ||--o{ PUBLIC_SEGMENTS : "parent_of"
    PUBLIC_CITIES ||--o{ PUBLIC_FORMS : "has"
    PUBLIC_SEGMENTS ||--o{ PUBLIC_FORMS : "evaluated_by"
    PUBLIC_FORMS ||--o{ PUBLIC_REVIEWS : "has"

    PUBLIC_AVALIACOES_IDECICLO ||--o{ PUBLIC_PONTUACOES_IDECICLO : "has"
    PUBLIC_AVALIACOES_IDECICLO ||--o{ PUBLIC_RESULTADOS_IDECICLO : "has"

    AUTH_USERS ||--o{ AUTH_SESSIONS : "has"
    AUTH_USERS ||--o{ AUTH_PERMISSIONS : "has"
```

## Observações

- `AUTH_MAGIC_LINKS.email` referencia o usuário por e-mail no fluxo da aplicação, mas não possui `FOREIGN KEY` formal no banco.
- `PUBLIC_AVALIACOES_IDECICLO.segment_id` e `PUBLIC_RESULTADOS_IDECICLO.segment_id` também não possuem `FOREIGN KEY` formal para `public.segments`.
- Tipos lógicos usados nas migrations:
  - `segment_type`: `Ciclofaixa`, `Ciclovia`, `Ciclorrota`, `Compartilhada`
  - `rating_type`: `A`, `B`, `C`, `D`
- Papéis esperados em `auth.permissions.role`:
  - `admin_global`
  - `admin_estado`
  - `admin_cidade`
  - `avaliador_estrutura_cicloviaria`
  - `refinador_dados_cidade`
  - `visualizador`
- Módulos esperados em `auth.permissions.module`:
  - `admin`
  - `avaliacao_estrutura_cicloviaria`
  - `refinamento_dados_cidade`
