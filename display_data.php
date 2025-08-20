<?php
require 'dbConnection.php';

try {
    // Replace 'YourTableName' with your actual table name
    $sql = "SELECT * FROM UserAccountTable ";
    $stmt = $conn->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("❌ Query failed: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Azure SQL Data Display</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        table { border-collapse: collapse; width: 80%; margin: auto; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #0078d4; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
    </style>
</head>
<body>

<h2 style="text-align:center;">Data from Azure SQL Database</h2>

<?php if (!empty($rows)): ?>
    <table>
        <tr>
            <?php foreach (array_keys($rows[0]) as $colName): ?>
                <th><?= htmlspecialchars((string) $colName) ?></th>
            <?php endforeach; ?>
        </tr>

        <?php foreach ($rows as $row): ?>
            <tr>
                <?php foreach ($row as $value): ?>
                    <td><?= htmlspecialchars($value ?? '') ?></td>
                <?php endforeach; ?>
            </tr>
        <?php endforeach; ?>
    </table>
<?php else: ?>
    <p>No records found.</p>
<?php endif; ?>


</body>
</html>
