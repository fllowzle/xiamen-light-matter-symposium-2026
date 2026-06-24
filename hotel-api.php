<?php
/**
 * Hotel Booking API for 5th XMU Symposium
 * Store: JSON file on same server - no external dependency
 */

$dataFile = __DIR__ . '/hotel-data.json';
$notifyEmail = '2239290302@qq.com';

// Load data
function loadData() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        http_response_code(500);
        die(json_encode(['success' => false, 'message' => 'Data file not found']));
    }
    return json_decode(file_get_contents($dataFile), true);
}

// Save data (with file locking for safety)
function saveData($data) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
}

// --- API ROUTER ---
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'availability') {
    // GET: return room availability
    header('Content-Type: application/json');
    $data = loadData();
    echo json_encode([
        'dates' => $data['dates'],
        'rooms' => $data['rooms']
    ]);

} elseif ($action === 'book') {
    // POST: book a room
    header('Content-Type: application/json');

    $room  = isset($_POST['room'])  ? trim($_POST['room'])  : '';
    $name  = isset($_POST['name'])  ? trim($_POST['name'])  : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $checkin  = isset($_POST['checkin'])  ? trim($_POST['checkin'])  : '';
    $checkout = isset($_POST['checkout']) ? trim($_POST['checkout']) : '';

    if (!$room || !$name || !$email || !$checkin || !$checkout) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => 'All fields are required']));
    }

    $data = loadData();

    // Parse checkin/checkout dates (expects format "Dec 18")
    $dateOrder = $data['dates'];
    $startIdx = array_search($checkin, $dateOrder);
    $endIdx   = array_search($checkout, $dateOrder);

    if ($startIdx === false || $endIdx === false || $startIdx >= $endIdx) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => 'Invalid date range']));
    }

    // Find the room
    $roomIdx = -1;
    foreach ($data['rooms'] as $i => $r) {
        if ($r['type'] === $room) { $roomIdx = $i; break; }
    }
    if ($roomIdx < 0) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => 'Room type not found']));
    }

    // Check availability for each night in range
    $nights = [];
    for ($d = $startIdx; $d < $endIdx; $d++) {
        $dateKey = $dateOrder[$d];
        $nights[] = $dateKey;
        if ($data['rooms'][$roomIdx]['daily'][$dateKey] <= 0) {
            die(json_encode(['success' => false, 'message' => "No availability for $dateKey"]));
        }
    }

    // Deduct availability
    foreach ($nights as $dateKey) {
        $data['rooms'][$roomIdx]['daily'][$dateKey]--;
    }

    // Record booking
    $booking = [
        'time'    => date('Y-m-d H:i:s'),
        'room'    => $room,
        'name'    => $name,
        'email'   => $email,
        'checkin' => $checkin,
        'checkout'=> $checkout,
        'nights'  => $nights
    ];
    $data['bookings'][] = $booking;

    // Save
    saveData($data);

    // Send email notification
    $nightList = implode(', ', $nights);
    $subject = "[Hotel Booking] $name - $room";
    $message = "New hotel booking:\n\n"
        . "Name: $name\n"
        . "Email: $email\n"
        . "Room: $room\n"
        . "Check-in: $checkin\n"
        . "Check-out: $checkout\n"
        . "Nights: $nightList\n"
        . "Time: {$booking['time']}\n";
    $headers = "From: noreply@photonics.xmu.edu.cn\r\nContent-Type: text/plain; charset=UTF-8";

    @mail($notifyEmail, $subject, $message, $headers);

    echo json_encode(['success' => true, 'message' => 'Booking confirmed!']);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unknown action']);
}
