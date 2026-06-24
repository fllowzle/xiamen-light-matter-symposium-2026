-- D1 Schema: Hotel Booking
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  price INTEGER NOT NULL,
  date_key TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  checkin TEXT NOT NULL,
  checkout TEXT NOT NULL,
  nights TEXT NOT NULL,
  time TEXT NOT NULL
);

-- Seed data
INSERT INTO rooms (type, price, date_key, available) VALUES
  ('(a) Deluxe Suite', 610, 'Dec 18', 8),
  ('(a) Deluxe Suite', 610, 'Dec 19', 8),
  ('(a) Deluxe Suite', 610, 'Dec 20', 8),
  ('(a) Deluxe Suite', 610, 'Dec 21', 8),
  ('(a) Deluxe Suite', 610, 'Dec 22', 8),
  ('(b) Standard Room', 350, 'Dec 18', 15),
  ('(b) Standard Room', 350, 'Dec 19', 15),
  ('(b) Standard Room', 350, 'Dec 20', 15),
  ('(b) Standard Room', 350, 'Dec 21', 15),
  ('(b) Standard Room', 350, 'Dec 22', 15),
  ('(c) Budget Room', 200, 'Dec 18', 10),
  ('(c) Budget Room', 200, 'Dec 19', 10),
  ('(c) Budget Room', 200, 'Dec 20', 10),
  ('(c) Budget Room', 200, 'Dec 21', 10),
  ('(c) Budget Room', 200, 'Dec 22', 10);
