ALTER TABLE bookings ADD COLUMN guests_count INT NOT NULL DEFAULT 1;

ALTER TABLE boat_requests ADD COLUMN departure_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE boat_requests ADD COLUMN return_at DATETIME(6) NULL;
ALTER TABLE boat_requests ADD COLUMN pickup_point VARCHAR(200) NULL;

ALTER TABLE boat_requests DROP COLUMN desired_date;
ALTER TABLE boat_requests DROP COLUMN departure_time;
ALTER TABLE boat_requests DROP COLUMN return_time;

ALTER TABLE complexes ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT TRUE;
