/*
  # Allow Staff Registration

  1. Changes
    - Add INSERT policy for staff_members table to allow authenticated users to create their own staff record
    - This enables the self-registration flow for staff accounts

  2. Security
    - Users can only insert records for their own user_id
    - Prevents users from creating staff records for other users
*/

CREATE POLICY "Authenticated users can create own staff record"
  ON staff_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);