/*
  # Staff Application System

  1. New Tables
    - `staff_members`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `discord_username` (text)
      - `role` (text) - staff role level
      - `created_at` (timestamptz)
    
    - `staff_applications`
      - `id` (uuid, primary key)
      - `discord_username` (text, required)
      - `discord_id` (text, required)
      - `age` (integer, required)
      - `timezone` (text, required)
      - `experience` (text, required)
      - `why_join` (text, required)
      - `availability` (text, required)
      - `additional_info` (text, optional)
      - `status` (text, default 'pending') - pending, approved, rejected
      - `created_at` (timestamptz)
      - `reviewed_by` (uuid, references staff_members)
      - `reviewed_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Staff members can view all applications
    - Only staff members can update application status
    - Anyone can submit an application (public form)
    - Staff members table is read-only for staff, admin-managed
*/

-- Create staff_members table
CREATE TABLE IF NOT EXISTS staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  discord_username text NOT NULL,
  role text NOT NULL DEFAULT 'moderator',
  created_at timestamptz DEFAULT now()
);

-- Create staff_applications table
CREATE TABLE IF NOT EXISTS staff_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_username text NOT NULL,
  discord_id text NOT NULL,
  age integer NOT NULL,
  timezone text NOT NULL,
  experience text NOT NULL,
  why_join text NOT NULL,
  availability text NOT NULL,
  additional_info text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES staff_members(id),
  reviewed_at timestamptz
);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_applications ENABLE ROW LEVEL SECURITY;

-- Staff members policies
CREATE POLICY "Staff members can view all staff"
  ON staff_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
    )
  );

-- Staff applications policies
CREATE POLICY "Anyone can submit applications"
  ON staff_applications FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Staff members can view all applications"
  ON staff_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff members can update applications"
  ON staff_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_applications_status ON staff_applications(status);
CREATE INDEX IF NOT EXISTS idx_staff_applications_created_at ON staff_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);