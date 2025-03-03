/*
  # Add payment fields to supports table

  1. Changes
    - Add payment_id column to supports table
    - Add payment_status column to supports table
  
  2. Purpose
    - Track payment information for support records
    - Allow filtering of supports by payment status
*/

-- Add payment fields to supports table
ALTER TABLE IF EXISTS supports 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Migration para adicionar a coluna goal_id na tabela supports

-- Adiciona a coluna goal_id como chave estrangeira referenciando goals
ALTER TABLE IF EXISTS supports 
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;
