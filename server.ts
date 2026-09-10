import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store file path (optional persistence for dev container restarts)
const DATA_FILE = path.join(process.cwd(), 'campus_event_hub_data.json');

interface DbState {
  events: any[];
  registrations: any[];
  users: any[];
}

// Strictly initialized EMPTY - zero preloaded mock data
let db: DbState = {
  events: [],
  registrations: [],
  users: []
};

// Try to load saved data if present, otherwise initialize empty
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      db.events = Array.isArray(parsed.events) ? parsed.events : [];
      db.registrations = Array.isArray(parsed.registrations) ? parsed.registrations : [];
      db.users = Array.isArray(parsed.users) ? parsed.users : [];
    }
  } catch (err) {
    console.warn('Could not read saved data, starting empty:', err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save data to disk:', err);
  }
}

loadData();

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existingUser) {
    return res.status(401).json({ error: 'No account found with this email. Please click "Create New Account" to register.' });
  }

  if (existingUser.password && password && existingUser.password !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  return res.json({ user: existingUser });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, role, college, department, phone, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existingUserIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name,
    email,
    role: role || 'student',
    college: college || 'DMI College of Engineering',
    department: department || 'Computer Science & Engineering',
    phone: phone || '',
    password: password || '',
    registeredDate: new Date().toISOString()
  };

  if (existingUserIndex >= 0) {
    db.users[existingUserIndex] = { ...db.users[existingUserIndex], ...newUser };
  } else {
    db.users.push(newUser);
  }
  saveData();

  return res.status(201).json({ user: newUser });
});

// --- Events Endpoints ---
app.get('/api/events', (req, res) => {
  const { category, department, format, search } = req.query;
  let filtered = [...db.events];

  if (category && category !== 'all') {
    filtered = filtered.filter(e => e.category?.toLowerCase() === String(category).toLowerCase());
  }

  if (department && department !== 'all') {
    filtered = filtered.filter(e => 
      e.department === 'All Departments' || 
      e.eligibleDepartments?.includes('All Departments') ||
      e.department === department ||
      e.eligibleDepartments?.includes(String(department))
    );
  }

  if (format && format !== 'all') {
    filtered = filtered.filter(e => e.format?.toLowerCase() === String(format).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.shortDescription?.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.organizerName?.toLowerCase().includes(q)
    );
  }

  // Update registeredCount dynamically based on confirmed registrations
  filtered = filtered.map(evt => {
    const count = db.registrations.filter(r => r.eventId === evt.id && r.status === 'confirmed').length;
    return { ...evt, registeredCount: count };
  });

  return res.json({ events: filtered });
});

app.get('/api/events/:id', (req, res) => {
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const count = db.registrations.filter(r => r.eventId === event.id && r.status === 'confirmed').length;
  return res.json({ event: { ...event, registeredCount: count } });
});

app.post('/api/events', (req, res) => {
  const data = req.body;
  if (!data.title || !data.category || !data.startDate) {
    return res.status(400).json({ error: 'Title, category, and start date are required' });
  }

  const newEvent = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: data.title,
    category: data.category,
    shortDescription: data.shortDescription || '',
    fullDescription: data.fullDescription || '',
    startDate: data.startDate,
    endDate: data.endDate || data.startDate,
    venue: data.venue || 'Campus Auditorium',
    format: data.format || 'Offline',
    department: data.department || 'All Departments',
    eligibleDepartments: Array.isArray(data.eligibleDepartments) ? data.eligibleDepartments : ['All Departments'],
    maxCapacity: Number(data.maxCapacity) || 100,
    registeredCount: 0,
    posterUrl: data.posterUrl || '',
    organizerName: data.organizerName || 'Campus Innovation Club',
    organizerContact: data.organizerContact || '',
    organizerId: data.organizerId || 'admin_1',
    status: 'upcoming',
    registrationDeadline: data.registrationDeadline || data.startDate,
    entryFee: data.entryFee || 'Free for students',
    perks: Array.isArray(data.perks) ? data.perks : ['Certificate of Participation', 'Networking'],
    schedule: Array.isArray(data.schedule) ? data.schedule : [],
    createdAt: new Date().toISOString()
  };

  db.events.unshift(newEvent);
  saveData();
  return res.status(201).json({ event: newEvent });
});

app.put('/api/events/:id', (req, res) => {
  const idx = db.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  db.events[idx] = {
    ...db.events[idx],
    ...req.body,
    id: db.events[idx].id, // preserve id
    maxCapacity: Number(req.body.maxCapacity) || db.events[idx].maxCapacity
  };
  saveData();
  return res.json({ event: db.events[idx] });
});

app.delete('/api/events/:id', (req, res) => {
  const idx = db.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const deleted = db.events.splice(idx, 1)[0];
  // Mark or clean registrations
  db.registrations = db.registrations.filter(r => r.eventId !== req.params.id);
  saveData();
  return res.json({ success: true, event: deleted });
});

// --- Attendee Tracker Endpoints ---
app.get('/api/events/:id/attendees', (req, res) => {
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const attendees = db.registrations.filter(r => r.eventId === req.params.id && r.status === 'confirmed');
  return res.json({
    eventTitle: event.title,
    maxCapacity: event.maxCapacity,
    registeredCount: attendees.length,
    attendees
  });
});

app.put('/api/events/:id/attendees/:registrationId/checkin', (req, res) => {
  const reg = db.registrations.find(r => r.id === req.params.registrationId && r.eventId === req.params.id);
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  reg.checkedIn = !reg.checkedIn;
  reg.checkedInAt = reg.checkedIn ? new Date().toISOString() : undefined;
  saveData();

  return res.json({ registration: reg });
});

// --- Registration Endpoints ---
app.get('/api/registrations', (req, res) => {
  const { userId, email } = req.query;
  let list = db.registrations.filter(r => r.status === 'confirmed');

  if (userId) {
    list = list.filter(r => r.userId === userId);
  } else if (email) {
    list = list.filter(r => r.studentEmail.toLowerCase() === String(email).toLowerCase());
  }

  // Attach event detail to each registration
  const withEvents = list.map(reg => {
    const event = db.events.find(e => e.id === reg.eventId);
    return {
      ...reg,
      event: event || null
    };
  });

  return res.json({ registrations: withEvents });
});

app.post('/api/registrations', (req, res) => {
  const { eventId, userId, studentName, studentEmail, college, department, phoneNumber } = req.body;

  if (!eventId || !studentName || !studentEmail) {
    return res.status(400).json({ error: 'Missing required registration details' });
  }

  const event = db.events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check if already registered
  const alreadyRegistered = db.registrations.find(
    r => r.eventId === eventId && r.studentEmail.toLowerCase() === studentEmail.toLowerCase() && r.status === 'confirmed'
  );
  if (alreadyRegistered) {
    return res.status(400).json({ error: 'You are already registered for this event', ticket: alreadyRegistered });
  }

  // Dynamic capacity check
  const activeRegistrations = db.registrations.filter(r => r.eventId === eventId && r.status === 'confirmed').length;
  if (activeRegistrations >= event.maxCapacity) {
    return res.status(400).json({ error: 'Registration full. Maximum capacity has been reached.' });
  }

  // Generate unique Ticket ID: CH-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketId = `CH-2026-${randomSuffix}`;

  const newRegistration = {
    id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    ticketId,
    eventId,
    userId: userId || 'student_' + Date.now(),
    studentName,
    studentEmail,
    college: college || 'DMI College of Engineering',
    department: department || 'Computer Science & Engineering',
    phoneNumber: phoneNumber || '',
    registeredAt: new Date().toISOString(),
    status: 'confirmed',
    checkedIn: false
  };

  db.registrations.push(newRegistration);
  event.registeredCount = activeRegistrations + 1;
  saveData();

  return res.status(201).json({
    registration: newRegistration,
    event
  });
});

app.delete('/api/registrations/:id', (req, res) => {
  const reg = db.registrations.find(r => r.id === req.params.id);
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  reg.status = 'cancelled';
  // Update event registeredCount
  const event = db.events.find(e => e.id === reg.eventId);
  if (event) {
    const active = db.registrations.filter(r => r.eventId === event.id && r.status === 'confirmed').length;
    event.registeredCount = active;
  }
  saveData();

  return res.json({ success: true, message: 'Registration cancelled successfully' });
});

// --- Analytics Overview Endpoint ---
app.get('/api/analytics', (req, res) => {
  const totalEvents = db.events.length;
  const activeRegistrations = db.registrations.filter(r => r.status === 'confirmed');
  const totalRegistrations = activeRegistrations.length;
  const totalCheckedIn = activeRegistrations.filter(r => r.checkedIn).length;
  
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;
  
  const totalCapacity = db.events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
  const seatOccupancyRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  // Category breakdown
  const categoryMap: Record<string, { count: number; registrations: number }> = {};
  db.events.forEach(e => {
    const cat = e.category || 'Other';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, registrations: 0 };
    }
    categoryMap[cat].count += 1;
  });

  activeRegistrations.forEach(r => {
    const event = db.events.find(e => e.id === r.eventId);
    if (event && categoryMap[event.category]) {
      categoryMap[event.category].registrations += 1;
    }
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    count: data.count,
    registrations: data.registrations
  }));

  // Department breakdown
  const deptMap: Record<string, number> = {};
  activeRegistrations.forEach(r => {
    const dept = r.department || 'General';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });

  const departmentBreakdown = Object.entries(deptMap).map(([department, count]) => ({
    department,
    count
  }));

  return res.json({
    totalEvents,
    totalRegistrations,
    totalCheckedIn,
    attendanceRate,
    seatOccupancyRate,
    categoryBreakdown,
    departmentBreakdown
  });
});

// --- Vite Middleware or Static Production Serving ---
async function startServer() {
  // Always serve static assets from public directory
  const publicPath = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Event Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
