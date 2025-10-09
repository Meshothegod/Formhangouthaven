/*
  # Add Delete Policy for Staff Applications

  1. Changes
    - Add DELETE policy to allow approved staff to delete applications
    - This enables cleanup of rejected applications
    
  2. Security
    - Only approved staff members can delete applications
    - Uses the is_approved_staff() helper function to avoid RLS recursion
*/

CREATE POLICY "Approved staff can delete applications"
  ON staff_applications FOR DELETE
  TO authenticated
  USING (is_approved_staff(auth.uid()));
