<?php
// api/categories.php
// CRUD simples de categorias (SQLite)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$dbFile = __DIR__ . '/../db/tattoos.sqlite';

function getDb() {
    global $dbFile;
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
}

// Inicializa banco se não existir tabela
$db = getDb();
$db->exec("CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE
)");

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') exit();

switch ($method) {
    case 'GET':
        $rows = $db->query('SELECT * FROM categories ORDER BY nome')->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = $data['nome'] ?? '';
        if ($nome) {
            $stmt = $db->prepare('INSERT OR IGNORE INTO categories (nome) VALUES (?)');
            $stmt->execute([$nome]);
            echo json_encode(['success'=>true]);
        } else {
            echo json_encode(['success'=>false, 'error'=>'Nome ausente']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error'=>'Método não permitido']);
}
