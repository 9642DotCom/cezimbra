<?php
// Proxy para HuggingFace Inference API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$prompt = $input['inputs'] ?? '';
if (!$prompt) {
    http_response_code(400);
    echo 'Prompt vazio';
    exit;
}

// Seu token HuggingFace
$token = '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';

$url = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: image/png'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['inputs' => $prompt]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpcode == 200 && strpos($contentType, 'image/png') !== false) {
    header('Content-Type: image/png');
    echo $response;
} else {
    http_response_code($httpcode);
    header('Content-Type: application/json');
    $msg = 'Erro ao gerar imagem';
    if (strpos($contentType, 'application/json') !== false) {
        $json = json_decode($response, true);
        if (isset($json['error'])) $msg = $json['error'];
    }
    echo json_encode(['error' => $msg]);
}
