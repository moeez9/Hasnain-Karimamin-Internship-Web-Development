<?php
declare(strict_types=1);

$title = trim((string)($_GET['title'] ?? 'Service'));
$category = trim((string)($_GET['category'] ?? 'Services'));

$title = $title !== '' ? mb_substr($title, 0, 42) : 'Service';
$category = $category !== '' ? mb_substr($category, 0, 18) : 'Services';

$palette = [
    'Web' => ['#2563eb', '#0f766e'],
    'Mobile' => ['#7c3aed', '#db2777'],
    'AI' => ['#0f766e', '#84cc16'],
    'Cloud' => ['#0284c7', '#2563eb'],
    'Backend' => ['#334155', '#f59e0b'],
    'Design' => ['#be123c', '#f59e0b'],
    'Database' => ['#4f46e5', '#0891b2'],
];

[$start, $end] = $palette[$category] ?? ['#111827', '#2563eb'];
$safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
$safeCategory = htmlspecialchars(strtoupper($category), ENT_QUOTES, 'UTF-8');
$initial = htmlspecialchars(strtoupper(substr($title, 0, 1)), ENT_QUOTES, 'UTF-8');

header('Content-Type: image/svg+xml; charset=utf-8');
header('Cache-Control: public, max-age=604800');

echo <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img" aria-label="$safeTitle">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="$start"/>
      <stop offset="100%" stop-color="$end"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <circle cx="650" cy="92" r="118" fill="#ffffff" opacity="0.12"/>
  <circle cx="90" cy="430" r="160" fill="#ffffff" opacity="0.1"/>
  <rect x="56" y="58" width="150" height="150" rx="22" fill="#ffffff" opacity="0.18"/>
  <text x="131" y="160" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="700" fill="#ffffff">$initial</text>
  <text x="56" y="304" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#dbeafe">$safeCategory</text>
  <text x="56" y="364" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#ffffff">$safeTitle</text>
</svg>
SVG;
