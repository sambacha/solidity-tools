import { PythonShell } from "python-shell";

let options = {
	mode: "text",
	pythonPath: "./",
	pythonOptions: ["-u"], // get print results in real-time
	scriptPath: "txn2dict.py",
	args: ["test", "connect", "run"],
};

PythonShell.run("txn2dict.py", options, function (err, results) {
	if (err) throw err;
	// results is an array consisting of messages collected during execution
	console.log("results: %j", results);
});
