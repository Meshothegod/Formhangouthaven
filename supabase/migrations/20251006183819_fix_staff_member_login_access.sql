/*
  # Fix Staff Member Login Access

  1. Changes
    - Update staff_members SELECT policy to allow users to view their own record
    - This enables the login flow where users need to check their approval status

  2. Security
    - Users can only read their own staff member record
    - Approved staff can still read all staff records
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Approved staff can view all staff" ON staff_members;

-- Create new policies
CREATE POLICY "Users can view own staff record"
  ON staff_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Approved staff can view all staff records"
  ON staff_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.approved = true
    )
  );