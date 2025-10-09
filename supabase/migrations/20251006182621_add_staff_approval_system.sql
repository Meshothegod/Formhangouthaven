/*
  # Add Staff Approval System

  1. Changes
    - Add `approved` column to staff_members table (default false)
    - Add `approved_by` column to track who approved the staff member
    - Add `approved_at` timestamp
    - Drop the old insert policy for staff_members
    - Create new policies that only allow approved staff to access dashboard

  2. Security
    - Only approved staff members can view applications and other staff
    - Registration requests must be approved by existing approved staff
    - Users can still create their own staff record, but it won't be approved by default
*/

-- Add approval columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_members' AND column_name = 'approved'
  ) THEN
    ALTER TABLE staff_members ADD COLUMN approved boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_members' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE staff_members ADD COLUMN approved_by uuid REFERENCES staff_members(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'staff_members' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE staff_members ADD COLUMN approved_at timestamptz;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated users can create own staff record" ON staff_members;
DROP POLICY IF EXISTS "Staff members can view all staff" ON staff_members;
DROP POLICY IF EXISTS "Staff members can view all applications" ON staff_applications;
DROP POLICY IF EXISTS "Staff members can update applications" ON staff_applications;

-- New staff_members policies
CREATE POLICY "Anyone can create staff registration request"
  ON staff_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND approved = false);

CREATE POLICY "Approved staff can view all staff"
  ON staff_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
      AND staff_members.approved = true
    )
  );

CREATE POLICY "Approved staff can approve pending staff"
  ON staff_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
      AND staff_members.approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
      AND staff_members.approved = true
    )
  );

-- New staff_applications policies (only approved staff can access)
CREATE POLICY "Approved staff can view all applications"
  ON staff_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
      AND staff_members.approved = true
    )
  );

CREATE POLICY "Approved staff can update applications"
  ON staff_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
      AND staff_members.approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members
      WHERE staff_members.user_id = auth.uid()
      AND staff_members.approved = true
    )
  );