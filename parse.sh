#!/bin/bash 

echo "init-package...."
echo {} > package.json

echo "init-solidity-parser..."
npm install --save solidity-parser

FILE=MContract.sol

node -e "console.log(JSON.stringify(require('solidity-parser').parseFile('./${FILE}'), null, 2))"

echo "sucessfuly generated"
