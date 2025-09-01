-- Fix function search path security issue by setting stable search path
CREATE OR REPLACE FUNCTION public.tg_audit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _actor uuid := auth.uid();
  _action public.audit_action;
begin
  if tg_op = 'INSERT' then
    _action := 'create';
    insert into public.audit_logs (actor_id, table_name, row_id, action, details)
    values (_actor, tg_table_name, new.id, _action, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    -- classify archive/resolve/complete if applicable
    if (new.archived_at is not null and (old.archived_at is null)) then
      _action := 'archive';
    elsif tg_table_name = 'eos_issues' and new.status = 'resolved' and old.status is distinct from 'resolved' then
      _action := 'resolve';
    elsif tg_table_name = 'eos_rocks' and new.status = 'completed' and old.status is distinct from 'completed' then
      _action := 'complete';
    else
      _action := 'update';
    end if;

    insert into public.audit_logs (actor_id, table_name, row_id, action, details)
    values (_actor, tg_table_name, new.id, _action, jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
    return new;
  end if;
  return new;
end;
$function$;