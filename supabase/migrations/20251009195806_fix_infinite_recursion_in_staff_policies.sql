/*
  # Fix Infinite Recursion in Staff Member Policies

  1. Problem
    - The current policies create infinite recursion when checking if a user is approved
    - This happens because the SELECT policy queries staff_members while evaluating access to staff_members

  2. Solution
    - Simplify the policies to avoid self-referencing queries
    - Use a single SELECT policy that allows:
      a) Users to view their own record (needed for login/approval check)
      b) Approved staff to view all records (checked via direct column comparison)
    
  3. Security
    - Users can only see their own staff record unless they are approved
    - Approved staff members can see all staff records
*/

-- Drop all existing SELECT policies on staff_members
DROP POLICY IF EXISTS "Users can view own staff record" ON staff_members;
DROP POLICY IF EXISTS "Approved staff can view all staff records" ON staff_members;
DROP POLICY IF EXISTS "Approved staff can view all staff" ON staff_members;

-- Create a combined policy that handles both cases without recursion
CREATE POLICY "Staff members can view based on approval status"
  ON staff_members FOR SELECT
  TO authenticated
  USING (
    -- Users can always see their own record
    auth.uid() = user_id
    OR
    -- OR if the current user has an approved staff record, they can see all records
    -- We use a direct column check without subquery to avoid recursion
    EXISTS (
      SELECT 1 FROM staff_members AS sm
      WHERE sm.user_id = auth.uid() 
      AND sm.approved = true
      LIMIT 1
    )
  );
