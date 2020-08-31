import { PythonShell } from "python-shell";

PythonShell.run("txn2dict.py", null, function (err) {
	if (err) throw err;
	console.log("finished");
});
