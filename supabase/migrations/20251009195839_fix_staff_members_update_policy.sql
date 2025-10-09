/*
  # Fix Staff Members Update Policy

  1. Changes
    - Update the staff_members UPDATE policy to use the is_approved_staff() helper function
    - This prevents recursion when approved staff try to approve pending staff members
    
  2. Security
    - Only approved staff can update staff member records
    - Uses the SECURITY DEFINER function to avoid RLS recursion
*/

-- Drop old policy
DROP POLICY IF EXISTS "Approved staff can approve pending staff" ON staff_members;

-- Recreate with helper function
CREATE POLICY "Approved staff can update staff records"
  ON staff_members FOR UPDATE
  TO authenticated
  USING (is_approved_staff(auth.uid()))
  WITH CHECK (is_approved_staff(auth.uid()));
