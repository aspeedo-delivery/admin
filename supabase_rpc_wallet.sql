-- Create the RPC function for atomic wallet balance adjustments
create or replace function public.admin_wallet_adjust_balance(
  p_user_id uuid,
  p_amount numeric,
  p_type text,
  p_description text
)
returns void
language plpgsql
security definer -- important to allow admin logic to run with elevated privileges if needed, or stick to RLS if admin has full access
as $$
begin
  -- Insert transaction
  insert into public.wallet_transactions (user_id, amount, type, description, timestamp)
  values (p_user_id, p_amount, p_type, p_description, now());

  -- Update wallet balance
  if p_type = 'credit' then
    update public.wallet_balance
    set balance = balance + p_amount
    where user_id = p_user_id;
  elsif p_type = 'debit' then
    update public.wallet_balance
    set balance = balance - p_amount
    where user_id = p_user_id;
  else
    raise exception 'Invalid type. Use credit or debit.';
  end if;
  
  -- Ensure balance row exists if it didn't (corner case, though foreign key implies it might, insert-on-conflict is safer usually, but assuming balance row exists from user creation trigger)
  if not found then
    -- Fallback: insert if not found (only for credit, can't debit non-existent)
    if p_type = 'credit' then
        insert into public.wallet_balance (user_id, balance) values (p_user_id, p_amount);
    else 
        raise exception 'Wallet not found for user';
    end if;
  end if;

end;
$$;
