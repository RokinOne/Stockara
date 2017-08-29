<?php
require_once 'config.php';

$data = json_decode($_POST["lines"]);

$con = mysqli_connect($host, $user, $pass, $db);

if (!$con) {
    die('Could not connect: ' . mysqli_error($con));
}

/* clear tables */
mysqli_query($con, "TRUNCATE TABLE stock");
mysqli_query($con, "TRUNCATE TABLE suppliers");

/* upload supplier data */
$suppliers = array();
for ($i = 2; $i < count($data) - 1; $i++) {
	$newSupplier = true;
	for ($j = 0; $j < count($suppliers); $j++) {
		if ($suppliers[$j] == $data[$i][0]) $newSupplier = false; 
	}
	if ($newSupplier) array_push($suppliers, $data[$i][0]);
}

$sql = "INSERT INTO suppliers (NAME) VALUES ";
for ($i = 0; $i < count($suppliers); $i++) {
	$sql .= "('" . $suppliers[$i] . "')";
	if ($i < count($suppliers) - 1) $sql .= ",";
}

if (mysqli_query($con, $sql)) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($con);
}

/* upload stock data */
$sql = "INSERT INTO stock (SUPPLIERID, DATE, VALUE) VALUES ";
for ($i = 1; $i < count($data) - 1; $i++) {
	for ($j = 0; $j < count($suppliers); $j++) { if ($data[$i][0] == $suppliers[$j]) $supplierID = $j + 1; }

	// convert DD/MM/YY date format to a valid one (YYYY-MM-DD)
	$dateValues = explode("/", $data[$i][1]);
	$date = "20" . $dateValues[2] . "-" . $dateValues[1] . "-" . $dateValues[0];

	$sql .= "(" . $supplierID . ", '" . $date . "'," . $data[$i][2] . ")";
	if ($i < count($data) - 2) $sql .= ",";
}

if (mysqli_query($con, $sql)) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($con);
}

mysqli_close($con);

