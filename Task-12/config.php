<?php
// Basic configuration for DB and admin login.
return [
    'db_host' => '127.0.0.1',
    'db_name' => 'task12',
    'db_user' => 'root',
    'db_pass' => '',
    'admin_user' => 'admin',
    'admin_pass' => 'admin123', // change this in production
    'admin_role' => 'admin',
    'upload_dir' => __DIR__ . '/uploads',
    'upload_url' => '../uploads',
];
