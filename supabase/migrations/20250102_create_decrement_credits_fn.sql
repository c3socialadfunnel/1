/*
  # Create decrement_credits function
  This migration adds a remote procedure call (RPC) for atomically decrementing user credits.

  ## Changes:
  - **New Function**: `public.decrement_credits(user_id_input uuid, amount int)`
    - Safely subtracts a specified amount from a user's credit balance.
    - Ensures a user's credits cannot drop below zero.
    - This atomic operation prevents race conditions where a user might spend more credits than they have.
*/

CREATE OR REPLACE FUNCTION public.decrement_credits(user_id_input uuid, amount int)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.users
  SET credits = credits - amount
  WHERE
    id = user_id_input AND credits >= amount;
  RETURN FOUND;
END;
$$;