-- FreshTrack Assistant Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Foods table
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'safe' CHECK (status IN ('safe', 'expiring', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent logs table
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on foods table
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Enable RLS on agent_logs table
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Foods policies: Users can only see/edit their own food items
CREATE POLICY "Users can view their own foods"
    ON foods FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own foods"
    ON foods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own foods"
    ON foods FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own foods"
    ON foods FOR DELETE
    USING (auth.uid() = user_id);

-- Agent logs policies: Users can only see their own agent logs
CREATE POLICY "Users can view their own agent logs"
    ON agent_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert agent logs"
    ON agent_logs FOR INSERT
    WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_foods_user_id ON foods(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_expiry_date ON foods(expiry_date);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
