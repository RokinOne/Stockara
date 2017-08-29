var companies = [];
var allData = [];
var graphData = [];

document.getElementById('upload-file').addEventListener('change', upload, false);
getSuppliers();

function drawGraph () {
	console.log("start drawing chart");
	graphData = [];
	var addNewData;
	var avgValue = 0, avgCount = 0;
	var maxValue = 0, minValue = -1;
	var startDate, endDate;

	// process all data, copy to graph data
	for (var k = 0; k < allData.length; k++) {
		addNewData = true;
		for (var p = 0; p < graphData.length; p++) {
			if (graphData[p][0] == allData[k][2]) { // if that date exists, add value to it
				graphData[p][1] += parseInt(allData[k][3]);
				addNewData = false;
			}
		}
		if (addNewData) {
			graphData[p] = [];
			graphData[p][0] = allData[k][2];
			graphData[p][1] = parseInt(allData[k][3]);
		}	
	}

	// sort graph data by date
	graphData.sort(function (a, b) {
		if (a[0] === b[0]) { return 0; }
		else { return (a[0] < b[0]) ? -1 : 1; }
	});

	// find min and max values
	for (var t = 0; t < graphData.length; t++) {
		if (graphData[t][1] > maxValue) maxValue = graphData[t][1];
		if (minValue < 0) minValue = graphData[t][1];
		else if (graphData[t][1] < minValue) minValue = graphData[t][1];
	}

	// get four dates for the chart
	startDate = graphData[0][0];
	endDate = graphData[graphData.length-1][0];
	var date1 = graphData[Math.floor(graphData.length / 5)][0];
	var date2 = graphData[Math.floor(graphData.length / 5) * 2][0];
	var date3 = graphData[Math.floor(graphData.length / 5) * 3][0];
	var date4 = graphData[Math.floor(graphData.length / 5) * 4][0];

	console.log("max stock value on one date is " + maxValue);
	console.log("time period is " + startDate + " - " + endDate);
	
	// plot chart
	setupChart(minValue, maxValue, date1, date2, date3, date4);
	var graph = document.getElementById("graph");
	var graphLine = document.getElementById("graphLine");
	var points = "";
	var pointXInc, pointY;
	var graphRect = graph.getBoundingClientRect();
	var graphH = graphRect.height;
	var graphW = graphRect.width;
	var datapoint;

	pointXInc = graphW / graphData.length;

	// main func for plotting chart points
	for (var r = 0; r < graphData.length; r++) {
		avgValue += graphData[r][1]; avgCount++; // calculate average stock value

		pointY = graphH - (((graphData[r][1] - minValue) * graphH) / (maxValue - minValue)); /* magic */
		points += " " + r * pointXInc + "," + pointY; // add chart point to list

		// create datapoints for hover
		datapoint = document.createElementNS("http://www.w3.org/2000/svg","circle");
		datapoint.setAttribute("cx", r * pointXInc);
		datapoint.setAttribute("cy", pointY);
		datapoint.setAttribute("r", "10");
		datapoint.setAttribute("onmouseover", "graphLineHover(evt, '" + graphData[r][0] + "'," + graphData[r][1] + ")");
		datapoint.setAttribute("onmouseout", "graphLineHoverOut()");
		graph.appendChild(datapoint);
	}
	graphLine.setAttribute("points", points);
	document.getElementById("avgValue").innerHTML = "Avg. stock value is " + (avgValue / avgCount).toFixed(2) + " EUR";

	console.log("done drawing chart");
}

/* setup chart grid and text */
function setupChart (minValue, maxValue, date1, date2, date3, date4) {
	var graph = document.getElementById("graph");
	var graphRect = graph.getBoundingClientRect();
	var graphH = graphRect.height;
	var graphW = graphRect.width;

	var line2H = graphH / 3 * 2;
	var line3H = graphH / 3;

	var graphx1 = document.getElementById("graphx1");
	var graphx2 = document.getElementById("graphx2");
	var graphx3 = document.getElementById("graphx3");
	var graphx4 = document.getElementById("graphx4");
	var graphy1 = document.getElementById("graphy1");

	var text1 = maxValue;
	var text2 = parseInt(minValue + (maxValue - minValue) / 3 * 2);
	var text3 = parseInt(minValue + (maxValue - minValue) / 3);
	var text4 = minValue;
	
	graphx1.setAttribute("x2", graphW);
	graphx2.setAttribute("y1", line2H);
	graphx2.setAttribute("x2", graphW);
	graphx2.setAttribute("y2", line2H);
	graphx3.setAttribute("x2", graphW);
	graphx3.setAttribute("y1", line3H);
	graphx3.setAttribute("y2", line3H);
	graphx4.setAttribute("x2", graphW);
	graphx4.setAttribute("y1", graphH);
	graphx4.setAttribute("y2", graphH);
	graphy1.setAttribute("y2", graphH);

	document.getElementById("grapht1").innerHTML = maxValue;
	document.getElementById("grapht2").innerHTML = text2;
	document.getElementById("grapht3").innerHTML = text3;
	document.getElementById("grapht4").innerHTML = minValue;
	document.getElementById("grapht5").innerHTML = date1;
	document.getElementById("grapht6").innerHTML = date2;
	document.getElementById("grapht7").innerHTML = date3;
	document.getElementById("grapht8").innerHTML = date4;
}

/* chart hover functions */
function graphLineHover (e, date, value) {
	var vertLine = document.getElementById("vertLine");
	var tooltip = document.getElementById("tooltip");
	var cx = e.target.getAttribute("cx");
	var cy = e.target.getAttribute("cy");
	vertLine.setAttribute("x1", cx);
	vertLine.setAttribute("x2", cx);
	vertLine.style.visibility = "visible";
	tooltip.innerHTML = "&nbsp;&nbsp;&nbsp;Stock value on " + date + " was " + value + " EUR";
	tooltip.setAttribute("x", cx);
	tooltip.setAttribute("y", cy);
	tooltip.style.visibility = "visible";
}

function graphLineHoverOut () {
	document.getElementById("tooltip").style.visibility = "hidden";
	document.getElementById("vertLine").style.visibility = "hidden";
}

/* AJAX functions */
function getSuppliers () {
	document.getElementById("supplier").innerHTML = "<span>SUPPLIER</span>";
	$.ajax({
		type: "POST",
		url: "getSuppliers.php",
		dataType: "json",
		success: function (ret) {
			console.log("got suppliers");
			var supplier = document.getElementById("supplier");
			var node;
			for (var i = 0; i < ret.length; i++) {
				node = document.createElement("div");
				node.innerHTML = "<hr>" + ret[i][1];
				node.innerHTML += '<input type="checkbox" name="company" onchange="getData()" value="'+ret[i][0]+'">';
				supplier.appendChild(node);
			}
		},
		error: function (e, ret) {
			console.log("ERROR getting suppliers");
			console.log(e);
		}
	});
}

function getData () {
	var companies = document.getElementsByName("company");
	var companyIDs = [];

	for (var i = 0; i < companies.length; i++) {
		if(companies[i].checked) companyIDs.push(companies[i].value);	// list checked suppliers
	}
	companyIDs = JSON.stringify(companyIDs);

	$.ajax({
		type: "POST",
		url: "getData.php",
		data: { 'companyIDs': companyIDs },
		success: function (ret) {
			console.log("got data");
			allData = JSON.parse(ret);
			drawGraph();
		},
		error: function (e, ret) {
			console.log("ERROR getting data");
			console.log(e);
			console.log(ret);
		}
	});
}

function upload (evt) {
    var data = null;
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        var csvData = event.target.result;
		var record_num = 3;
		var allTextLines = csvData.split(/\r\n|\n|\r/);
	    var headings = allTextLines[0].split(';');
		var lines = [];

		for (var j = 0; j < allTextLines.length; j++) {
			var entry = [];
			entry = allTextLines[j].split(';');

			// discard empty entries
			if (!((entry[0] == "") && (entry[1] == "") && (entry[2] == ""))) lines.push(entry);

			// add to list of suppliers
			var add = 1;
			for (var k = 0; k < companies.length; k++) { if (entry[0] == companies[k]) add = 0; }
			if (add) companies.push(entry[0]);
		}

		lines = JSON.stringify(lines);
		$.ajax({
			type: "POST",
			url: "setData.php",
			data: { 'lines':lines },
			success: function (ret) {
				console.log("new data uploaded");
				getSuppliers();
			},
			error: function (e, ret) {
				console.log("ERROR uploading data");
				console.log(e);
				console.log(ret);
			}
		});
    };
    reader.onerror = function() {
        alert('Unable to read ' + file.fileName);
    };
}
