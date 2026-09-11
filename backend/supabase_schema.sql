-- ==============================================================================
-- Supabase Schema for Class AI (Smart WhatsApp Bot & Class Dashboard)
-- Copy and paste this script into your Supabase SQL Editor.
-- ==============================================================================

-- 1. Table: messages (Log pesan mentah dari WhatsApp atau Simulator)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_message_id TEXT,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'document'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: assignments (Tugas Kuliah & Deadline)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: schedules (Jadwal Kuliah Mingguan)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    date DATE,
    day_of_week TEXT, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    start_time TEXT NOT NULL, -- e.g. '10:15'
    end_time TEXT NOT NULL,   -- e.g. '11:55'
    location TEXT,            -- e.g. 'Ruang 4S.1' / 'Lab Komputer 2'
    source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: announcements (Pengumuman Kelas)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Row Level Security (RLS) configuration for public access or authenticated access
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow anon insert messages" ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow anon insert assignments" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update assignments" ON assignments FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete assignments" ON assignments FOR DELETE USING (true);

CREATE POLICY "Allow anon select schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "Allow anon insert schedules" ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update schedules" ON schedules FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete schedules" ON schedules FOR DELETE USING (true);

CREATE POLICY "Allow anon select announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow anon insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete announcements" ON announcements FOR DELETE USING (true);
