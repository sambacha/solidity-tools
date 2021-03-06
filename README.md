# Smart Contract Tools

## Overview

> Various Tools for working with contracts

### Gwei Contract Monitor

Alerts for Contracts for *potential* attacks through transactions

### Solidity AST Generator

### Overview

`$ sh parse.sh`

#### Output
```json
{
  "type": "Program",
  "body": [
    {
      "type": "ContractStatement",
      "name": "MyContract",
      "is": [],
      "body": [
        {
          "type": "ExpressionStatement",
          "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
              "type": "DeclarativeExpression",
              "name": "counter",
              "literal": {
                "type": "Type",
                "literal": "uint",
                "members": [],
                "array_parts": []
              },
              "is_constant": false,
              "is_public": false,
              "is_memory": false
            },
            "right": {
              "type": "Literal",
              "value": 0
            }
          }
        },
        {
          "type": "FunctionDeclaration",
          "name": "Count",
          "params": null,
          "modifiers": null,
          "body": {
            "type": "BlockStatement",
            "body": [
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "UpdateExpression",
                  "operator": "++",
                  "argument": {
                    "type": "Identifier",
                    "name": "counter"
                  },
                  "prefix": false
                }
              }
            ]
          },
          "is_abstract": false
        },
        {
          "type": "FunctionDeclaration",
          "name": "CallCount",
          "params": null,
          "modifiers": null,
          "body": {
            "type": "BlockStatement",
            "body": [
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "CallExpression",
                  "callee": {
                    "type": "Identifier",
                    "name": "Count"
                  },
                  "arguments": []
                }
              }
            ]
          },
          "is_abstract": false
        },
        {
          "type": "FunctionDeclaration",
          "name": "Send",
          "params": null,
          "modifiers": null,
          "body": {
            "type": "BlockStatement",
            "body": [
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "CallExpression",
                  "callee": {
                    "type": "MemberExpression",
                    "object": {
                      "type": "MemberExpression",
                      "object": {
                        "type": "Identifier",
                        "name": "msg"
                      },
                      "property": {
                        "type": "Identifier",
                        "name": "sender"
                      },
                      "computed": false
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "send"
                    },
                    "computed": false
                  },
                  "arguments": [
                    {
                      "type": "Literal",
                      "value": 1
                    }
                  ]
                }
              }
            ]
          },
          "is_abstract": false
        },
        {
          "type": "FunctionDeclaration",
          "name": "Call",
          "params": null,
          "modifiers": null,
          "body": {
            "type": "BlockStatement",
            "body": [
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "CallExpression",
                  "arguments": [],
                  "callee": {
                    "type": "MemberExpression",
                    "property": {
                      "type": "Identifier",
                      "name": "call"
                    },
                    "computed": false,
                    "object": {
                      "type": "CallExpression",
                      "callee": {
                        "type": "MemberExpression",
                        "object": {
                          "type": "MemberExpression",
                          "object": {
                            "type": "Identifier",
                            "name": "msg"
                          },
                          "property": {
                            "type": "Identifier",
                            "name": "sender"
                          },
                          "computed": false
                        },
                        "property": {
                          "type": "Identifier",
                          "name": "value"
                        },
                        "computed": false
                      },
                      "arguments": [
                        {
                          "type": "Literal",
                          "value": 1
                        }
                      ]
                    }
                  }
                }
              }
            ]
          },
          "is_abstract": false
        }
      ]
    }
  ]
}
```

## License
ISC
