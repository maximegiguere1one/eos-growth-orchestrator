-- Manually confirm the admin user email (fix)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'maxime@giguere-influence.com';