/*
  # Fix Recursion Using Function with Security Definer

  1. Problem
    - RLS policies that query the same table they protect cause infinite recursion
    
  2. Solution
    - Create a helper function with SECURITY DEFINER that bypasses RLS
    - This function checks if a user is an approved staff member
    - Use this function in policies to avoid recursion
    
  3. Security
    - Function only returns boolean, no sensitive data exposed
    - Users can view own record for login flow
    - Approved staff can view all records
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Staff members can view based on approval status" ON staff_members;
DROP POLICY IF EXISTS "Users can view own staff record" ON staff_members;
DROP POLICY IF EXISTS "Approved staff can view all staff records" ON staff_members;

-- Create a helper function that bypasses RLS to check approval status
CREATE OR REPLACE FUNCTION is_approved_staff(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM staff_members 
    WHERE user_id = user_uuid 
    AND approved = true
  );
$$;

-- Now create policies using this helper function
CREATE POLICY "Users can view own staff record"
  ON staff_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Approved staff can view all staff records"
  ON staff_members FOR SELECT
  TO authenticated
  USING (is_approved_staff(auth.uid()));
