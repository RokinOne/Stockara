<?php
require_once 'config.php';

$suppliers = json_decode($_POST["companyIDs"]);

$con = mysqli_connect($host, $user, $pass, $db);
if (!$con) { die('Could not connect: ' . mysqli_error($con)); }

$sql = "SELECT * FROM stock INNER JOIN suppliers ON stock.SUPPLIERID = suppliers.ID WHERE (SUPPLIERID = " . $suppliers[0] . ")";

for ($i = 1; $i < count($suppliers); $i++) {
	$sql .= " OR (SUPPLIERID = " . $suppliers[$i] . ")";
}

$query = mysqli_query($con, $sql);

if (mysqli_num_rows($query) > 0) {
    $result = mysqli_fetch_all($query);
	echo json_encode($result);

} else {
    echo "0 results";
}

mysqli_close($con);

