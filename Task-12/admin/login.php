<?php
session_start();
$config = require __DIR__ . '/../config.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (hash_equals($config['admin_user'], $username) && hash_equals($config['admin_pass'], $password)) {
        session_regenerate_id(true);
        $_SESSION['is_admin'] = true;
        $_SESSION['admin_role'] = $config['admin_role'] ?? 'admin';
        header('Location: dashboard.php');
        exit;
    }
    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | Services</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-page">
    <main class="login-box">
        <h1>Admin Login</h1>
        <?php if ($error): ?>
            <div class="alert danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        <form method="post" novalidate>
            <label>
                Username
                <input type="text" name="username" required autofocus>
            </label>
            <label>
                Password
                <input type="password" name="password" required>
            </label>
            <button type="submit" class="btn primary">Sign In</button>
        </form>
    </main>
</body>
</html>
