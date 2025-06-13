<?php
// api/tattoos.php
// API para CRUD de tatuagens com upload de imagens (SQLite)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$dbFile = __DIR__ . '/../db/tattoos.sqlite';
$uploadsDir = __DIR__ . '/../uploads/';
if (!file_exists($uploadsDir)) mkdir($uploadsDir, 0777, true);

function getDb() {
    global $dbFile;
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
}

// Inicializa banco/tabela se não existir
$db = getDb();
$db->exec("CREATE TABLE IF NOT EXISTS tattoos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    categoria TEXT,
    preco TEXT,
    imagem TEXT
)");

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') exit();

switch ($method) {
    case 'GET':
        // Lista todas as tatuagens
        $db = getDb();
        $rows = $db->query('SELECT * FROM tattoos ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        break;
    case 'POST':
        // Upload múltiplo de imagens + dados
        $db = getDb();
        $output = [];
        foreach ($_FILES['imagens']['tmp_name'] as $i => $tmpName) {
            $nome = $_POST['nomes'][$i] ?? '';
            $categoria = $_POST['categorias'][$i] ?? '';
            $preco = $_POST['precos'][$i] ?? '';
            $imgName = uniqid('tattoo_') . '_' . basename($_FILES['imagens']['name'][$i]);
            $imgPath = $uploadsDir . $imgName;
            move_uploaded_file($tmpName, $imgPath);
            $imgDbPath = 'uploads/' . $imgName;
            $stmt = $db->prepare('INSERT INTO tattoos (nome, categoria, preco, imagem) VALUES (?, ?, ?, ?)');
            $stmt->execute([$nome, $categoria, $preco, $imgDbPath]);
            $output[] = [
                'id' => $db->lastInsertId(),
                'nome' => $nome,
                'categoria' => $categoria,
                'preco' => $preco,
                'imagem' => $imgDbPath
            ];
        }
        echo json_encode($output);
        break;
    case 'DELETE':
        // Remove tatuagem
        parse_str(file_get_contents('php://input'), $_DELETE);
        $id = $_DELETE['id'] ?? null;
        if ($id) {
            $db = getDb();
            $img = $db->query("SELECT imagem FROM tattoos WHERE id=" . intval($id))->fetchColumn();
            if ($img && file_exists(__DIR__ . '/../' . $img)) unlink(__DIR__ . '/../' . $img);
            $db->exec("DELETE FROM tattoos WHERE id=" . intval($id));
            echo json_encode(['success'=>true]);
        } else {
            echo json_encode(['success'=>false, 'error'=>'ID ausente']);
        }
        break;
    case 'PUT':
        // Edita tatuagem
        parse_str(file_get_contents('php://input'), $_PUT);
        $id = $_PUT['id'] ?? null;
        $nome = $_PUT['nome'] ?? '';
        $categoria = $_PUT['categoria'] ?? '';
        $preco = $_PUT['preco'] ?? '';
        if ($id) {
            $db = getDb();
            $stmt = $db->prepare('UPDATE tattoos SET nome=?, categoria=?, preco=? WHERE id=?');
            $stmt->execute([$nome, $categoria, $preco, $id]);
            echo json_encode(['success'=>true]);
        } else {
            echo json_encode(['success'=>false, 'error'=>'ID ausente']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error'=>'Método não permitido']);
}
