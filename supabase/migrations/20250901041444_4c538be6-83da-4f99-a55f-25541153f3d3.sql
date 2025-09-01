-- Manually confirm the admin user email
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW() 
WHERE email = 'maxime@giguere-influence.com';