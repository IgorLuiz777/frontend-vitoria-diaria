/*
  # Add description field to goals table

  1. Changes
    - Add `description` TEXT field to the `goals` table
    - This allows users to provide more context about their goals
*/

-- Add description field to goals table
ALTER TABLE IF EXISTS goals
ADD COLUMN IF NOT EXISTS description TEXT;