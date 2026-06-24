DELETE FROM bookings WHERE name='TestSelect';
UPDATE rooms SET available = 72 WHERE type='(d) Standard Twin' AND date_key IN ('Dec 18','Dec 19');
