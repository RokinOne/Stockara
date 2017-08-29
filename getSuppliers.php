<?php
require_once 'config.php';

$con = mysqli_connect($host, $user, $pass, $db);
if (!$con) { die("Connection failed: " . mysqli_connect_error()); }

$sql = "SELECT * FROM suppliers";
$query = mysqli_query($con, $sql);

if (mysqli_num_rows($query) > 0) {
    $result = mysqli_fetch_all($query);
	echo json_encode($result);
} else {
    echo "0 results";
}

mysqli_close($con);

