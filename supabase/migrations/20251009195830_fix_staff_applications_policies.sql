/*
  # Fix Staff Applications Policies to Use Helper Function

  1. Changes
    - Update staff_applications policies to use the is_approved_staff() helper function
    - This prevents recursion issues when checking approval status
    
  2. Security
    - Only approved staff can view and update applications
    - Uses the SECURITY DEFINER function to avoid RLS recursion
*/

-- Drop old policies
DROP POLICY IF EXISTS "Approved staff can view all applications" ON staff_applications;
DROP POLICY IF EXISTS "Approved staff can update applications" ON staff_applications;

-- Recreate with helper function
CREATE POLICY "Approved staff can view all applications"
  ON staff_applications FOR SELECT
  TO authenticated
  USING (is_approved_staff(auth.uid()));

CREATE POLICY "Approved staff can update applications"
  ON staff_applications FOR UPDATE
  TO authenticated
  USING (is_approved_staff(auth.uid()))
  WITH CHECK (is_approved_staff(auth.uid()));
