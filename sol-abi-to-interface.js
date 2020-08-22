#!/usr/bin/env node
// Credits: @rangelife

var fs=require('fs');

try {
	var abi=JSON.parse(fs.readFileSync(process.argv[3]));
} catch (e) {
	dieUsage();
}

var contractName=process.argv[2];

if(!contractName) dieUsage();

var toDump="";
function dump(x) {
	toDump += x;
}


dump("contract "+contractName);
dump("{");

var i=0;
for(i=0;i<abi.length;i++) {
	var entity=abi[i];
	if (!Array.isArray(entity.inputs)) {
		die("entity inputs isn't an array in "+JSON.stringify(entity));
	}
	switch (entity.type) {
		case 'constructor':
			dumpConstructor(entity);
			break;
		case 'function':
			dumpFunction(entity);
			break;
		case 'event':
			// these don't go in the interface file
			break;
		default:
			die("Unknown entity type "+entity.type+" in ABI.");
	}
}

dump("}");



console.log(toDump);


///////////

function die(x) {
	console.error(x);
	process.exit(1);
}

function dieUsage() {
	die("Usage: "+process.argv[1]+" [contractName] [ABI file]");
}

function dumpConstructor(entity) {
	dump("function "+contractName+"(");
	dumpArgs(entity.inputs);
	dump(");");
}

function dumpFunction(entity) {
	dump("function "+entity.name+"(");
	dumpArgs(entity.inputs);
	dump(") ");
	if (entity.constant) {
		dump("constant ");
	}
	if (entity.outputs.length) {
		dump("returns (");
		dumpArgs(entity.outputs);
		dump(")")
	}
	dump(";");
}

function dumpArgs(args) {
	var i;
	for (i=0;i<args.length;i++) {
		var arg = args[i];
		if(i) dump(",");
		dump(arg.type+" "+arg.name);
	}
}
