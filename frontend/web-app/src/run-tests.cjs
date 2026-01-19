const axios = require("axios");
const sleep = (waitTimeInMs) =>
	new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

async function sendAxiosPost(url, dataObj) {
	try {
		const res = await axios.post(url, { graph: dataObj });
		return res.data;
	} catch (err) {
		console.log(err);
	}
}

async function sendAxiosGet(url) {
	try {
		const response = await axios.get(url);
		return response.data.result;
	} catch (error) {
		console.error("Error:", error.message);
		throw error;
	}
}

async function talkToService(url, graph) {
	try {
		const solveResponse = await sendAxiosPost(url + "/solve", graph);
		if (solveResponse.message === "Request received and processing started.") {
			console.log("Processing started. Waiting for result...");
		}
		let result = null;
		while (!result) {
			await sleep(3000);
			result = await sendAxiosGet(url + "/result");
		}
		console.log("Processing complete.");
		return result;
	} catch (error) {
		console.error("Error processing graph:", error.message);
	}
}

function calculateAccuracy(expectedCost, calculatedCost) {
	const accuracy = (expectedCost / calculatedCost) * 100;
	return accuracy;
}

function formatTime(milliseconds) {
	const hours = Math.floor(milliseconds / 3600000);
	const minutes = Math.floor((milliseconds % 3600000) / 60000);
	const seconds = Math.floor((milliseconds % 60000) / 1000);
	const ms = (milliseconds % 1000).toFixed(2);
	const formattedHours = hours > 0 ? `${hours}h, ` : "";
	const formattedMinutes = minutes > 0 ? `${minutes}m, ` : "";
	const formattedSeconds = seconds > 0 ? `${seconds}s, ` : "";
	if (milliseconds < 1000) {
		return `${ms}ms`;
	} else {
		return `${formattedHours}${formattedMinutes}${formattedSeconds}${ms}ms`;
	}
}

async function runTest(graph, algorithm) {
	let url = "";
	let res = {};
	switch (algorithm) {
		case "nearest-neighbour":
			url = process.env.NEAREST_NEIGHBOUR_URL || "http://localhost:3000/solve";
			res = await sendAxiosPost(url, graph, { timeout: 360000 });
			break;
		case "cheapest-insertion":
			url = process.env.CHEAPEST_INSERTION_URL || "http://localhost:3010/solve";
			res = await sendAxiosPost(url, graph, { timeout: 360000 });
			break;
		case "dynamic-programming":
			url = process.env.DYNAMIC_PROGRAMMING_URL || "http://localhost:3020/solve";
			res = await sendAxiosPost(url, graph, { timeout: 3600000 });
			break;
		case "brute-force":
			url = process.env.BRUTE_FORCE_URL || "http://localhost:3030";
			res = await talkToService(url, graph);
			break;
		case "three-opt":
			url = process.env.THREE_OPT_URL || "http://localhost:3040";
			res = await talkToService(url, graph);
			break;
		default:
			console.log("Invalid choice.");
	}
	return {
		GraphName: graph.name,
		Coordinates: graph.coordinates,
		ExpectedTour: graph.tour,
		ExpectedCost: graph.cost,
		ActualTour: res.Tour,
		ActualCost: res.Cost,
		Time: formatTime(res.Time),
		Accuracy: calculateAccuracy(graph.cost, res.Cost),
	};
}

module.exports = runTest;
