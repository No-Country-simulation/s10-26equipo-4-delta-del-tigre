-- V1: esquema inicial de HostFlow (MySQL 8)

CREATE TABLE owners (
                        id                    BINARY(16)   NOT NULL,
                        name                  VARCHAR(120) NOT NULL,
                        email                 VARCHAR(180) NOT NULL,
                        password_hash         VARCHAR(100) NOT NULL,
                        phone                 VARCHAR(40),
                        country               VARCHAR(80),
                        identification_type   VARCHAR(20),
                        identification_number VARCHAR(40),
                        created_at            DATETIME(6)  NOT NULL,
                        PRIMARY KEY (id),
                        CONSTRAINT uq_owners_email UNIQUE (email)
);

CREATE TABLE complexes (
                           id             BINARY(16)   NOT NULL,
                           owner_id       BINARY(16)   NOT NULL,
                           name           VARCHAR(150) NOT NULL,
                           slug           VARCHAR(160) NOT NULL,
                           address        VARCHAR(255),
                           logo_url       VARCHAR(500),
                           brand_colors   VARCHAR(100),
                           account_holder VARCHAR(150),
                           alias_cbu      VARCHAR(60),
                           bank           VARCHAR(100),
                           created_at     DATETIME(6)  NOT NULL,
                           PRIMARY KEY (id),
                           CONSTRAINT uq_complexes_slug UNIQUE (slug),
                           CONSTRAINT fk_complexes_owner FOREIGN KEY (owner_id) REFERENCES owners (id)
);

CREATE TABLE addons (
                        id          BINARY(16)     NOT NULL,
                        complex_id  BINARY(16)     NOT NULL,
                        name        VARCHAR(150)   NOT NULL,
                        description VARCHAR(500),
                        price       DECIMAL(12, 2) NOT NULL,
                        active      BOOLEAN        NOT NULL DEFAULT TRUE,
                        created_at  DATETIME(6)    NOT NULL,
                        PRIMARY KEY (id),
                        CONSTRAINT fk_addons_complex FOREIGN KEY (complex_id) REFERENCES complexes (id)
);

-- La reserva incluye los datos del huésped (no hay tabla de turistas)
CREATE TABLE bookings (
                          id                           BINARY(16)   NOT NULL,
                          complex_id                   BINARY(16)   NOT NULL,
                          check_in                     DATE         NOT NULL,
                          check_out                    DATE         NOT NULL,
                          status                       VARCHAR(20)  NOT NULL,
                          guest_name                   VARCHAR(150) NOT NULL,
                          guest_identification_type    VARCHAR(20),
                          guest_identification_number  VARCHAR(40),
                          guest_email                  VARCHAR(180),
                          guest_phone                  VARCHAR(40),
                          preferences                  VARCHAR(1000),
                          other_allergies              VARCHAR(500),
                          created_at                   DATETIME(6)  NOT NULL,
                          PRIMARY KEY (id),
                          CONSTRAINT fk_bookings_complex FOREIGN KEY (complex_id) REFERENCES complexes (id)
);
CREATE INDEX idx_bookings_complex_check_in ON bookings (complex_id, check_in);

CREATE TABLE booking_allergies (
                                   booking_id BINARY(16)  NOT NULL,
                                   allergy    VARCHAR(40) NOT NULL,
                                   PRIMARY KEY (booking_id, allergy),
                                   CONSTRAINT fk_booking_allergies_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
);

-- unit_price se copia del adicional al momento de la compra
CREATE TABLE booking_addons (
                                id         BINARY(16)     NOT NULL,
                                booking_id BINARY(16)     NOT NULL,
                                addon_id   BINARY(16)     NOT NULL,
                                quantity   INT            NOT NULL,
                                unit_price DECIMAL(12, 2) NOT NULL,
                                PRIMARY KEY (id),
                                CONSTRAINT fk_booking_addons_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
                                CONSTRAINT fk_booking_addons_addon   FOREIGN KEY (addon_id)   REFERENCES addons (id)
);

CREATE TABLE boat_requests (
                               id             BINARY(16)  NOT NULL,
                               booking_id     BINARY(16)  NOT NULL,
                               desired_date   DATE        NOT NULL,
                               departure_time TIME        NOT NULL,
                               return_time    TIME,
                               passengers     INT         NOT NULL,
                               comments       VARCHAR(500),
                               payload_json   JSON,
                               status         VARCHAR(10) NOT NULL,
                               created_at     DATETIME(6) NOT NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_boat_requests_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
);