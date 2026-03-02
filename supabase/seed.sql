-- Seed categories
INSERT INTO public.categories (name, slug, icon, display_order) VALUES
  ('Electronics', 'electronics', 'Laptop', 1),
  ('Furniture', 'furniture', 'Armchair', 2),
  ('Textbooks', 'textbooks', 'BookOpen', 3),
  ('Clothing', 'clothing', 'Shirt', 4),
  ('Sports & Outdoors', 'sports-outdoors', 'Dumbbell', 5),
  ('Kitchen & Home', 'kitchen-home', 'ChefHat', 6),
  ('School Supplies', 'school-supplies', 'Pencil', 7),
  ('Tickets & Events', 'tickets-events', 'Ticket', 8),
  ('Free Stuff', 'free-stuff', 'Gift', 9),
  ('Other', 'other', 'Package', 10);

-- Seed meetup spots (UWaterloo campus locations)
INSERT INTO public.meetup_spots (name, description, latitude, longitude, building_code, is_indoor, hours) VALUES
  ('DC Library Main Entrance', 'Well-lit entrance with security cameras. Popular study spot with high foot traffic.', 43.4727, -80.5420, 'DC', TRUE, 'Open 24/7 during term'),
  ('SLC Great Hall', 'Large open area in the Student Life Centre. Busy during daytime hours.', 43.4718, -80.5453, 'SLC', TRUE, '7am-11pm Mon-Fri, 9am-11pm Sat-Sun'),
  ('PAC Front Entrance', 'Main entrance of the Physical Activities Complex. Well-trafficked area.', 43.4720, -80.5475, 'PAC', TRUE, '6am-11pm Mon-Fri, 8am-10pm Sat-Sun'),
  ('MC Comfy Lounge', 'Casual seating area in the Math & Computer building. Great for quick exchanges.', 43.4720, -80.5439, 'MC', TRUE, '7am-11pm Mon-Fri'),
  ('E7 Atrium', 'Modern atrium in Engineering 7. Bright and open with seating areas.', 43.4729, -80.5394, 'E7', TRUE, '7am-10pm Mon-Fri'),
  ('QNC Lobby', 'Quantum Nano Centre lobby. Quiet and professional environment.', 43.4712, -80.5445, 'QNC', TRUE, '8am-6pm Mon-Fri'),
  ('SCH Food Court', 'South Campus Hall food court. Busy at mealtimes, good for casual meetups.', 43.4709, -80.5465, 'SCH', TRUE, '8am-8pm Mon-Fri, 10am-6pm Sat-Sun'),
  ('Turnkey Desk (SLC)', 'Information desk area in SLC. Staff present, safe and central location.', 43.4717, -80.5452, 'SLC', TRUE, '8:30am-10:30pm Mon-Fri');
