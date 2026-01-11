-- Create the RPC function for dashboard overview chart
create or replace function public.get_dashboard_overview()
returns table (
  month text,
  revenue numeric,
  orders bigint
)
language sql
security definer -- allows running without strict RLS on underlying tables if needed for stats
as $$
  select
    to_char(date_trunc('month', generated_date), 'Mon') as month,
    coalesce(sum(o.total_amount), 0) as revenue,
    count(o.id) as orders
  from
    generate_series(
      date_trunc('month', now()) - interval '6 months',
      date_trunc('month', now()),
      '1 month'
    ) as generated_date
  left join
    public.orders o on date_trunc('month', o.created_at) = generated_date
  group by
    generated_date
  order by
    generated_date asc;
$$;
