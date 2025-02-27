--
-- Create the super admin user
--

WITH new_user AS (
    INSERT INTO :EXPOSED_SCHEMA.users (created_at)
        VALUES (NOW())
        RETURNING id
)
INSERT INTO :AUTH_SCHEMA.local_logins (user_id, username, role, password)
SELECT id, ':ADMIN_USER', 'superadmin', :AUTH_SCHEMA.hash_password(':ADMIN_PASSWORD')
FROM new_user;
