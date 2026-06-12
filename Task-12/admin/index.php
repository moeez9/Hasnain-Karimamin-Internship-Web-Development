<?php
session_start();
if (!empty($_SESSION['is_admin'])) {
    header('Location: dashboard.php');
} else {
    header('Location: login.php');
}
exit;
