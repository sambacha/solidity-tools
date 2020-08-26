# SMT-Friendly Formalization of the Solidity Memory Model


## mythril, verisol, smt-checker, and solc-verify


| **assignment (102)** | **correct incorrect unsupported timeout** | **** | **** | **** | **time (s)** |
|----------------------|-------------------------------------------|------|------|------|--------------|
| mythril              | 94                                        | 0    | 0    | 8    | 1655\.14     |
| verisol              | 10                                        | 61   | 31   | 0    | 175\.27      |
| smt\-checker         | 6                                         | 9    | 87   | 0    | 15\.25       |
| solc\-verify         | 78                                        | 8    | 16   | 0    | 62\.81       |
| delete \(14\)        | correct incorrect unsupported timeout     |      |      |      | time \(s\)   |
| mythril              | 13                                        | 1    | 0    | 0    | 47\.51       |
| verisol              | 3                                         | 8    | 3    | 0    | 24\.66       |
| smt\-checker         | 0                                         | 0    | 14   | 0    | 0\.3         |
| solc\-verify         | 7                                         | 1    | 6    | 0    | 9\.02        |
| init \(18\)          | correct incorrect unsupported timeout     |      |      |      | time \(s\)   |
| mythril              | 15                                        | 3    | 0    | 0    | 59\.67       |
| verisol              | 7                                         | 8    | 3    | 0    | 28\.82       |
| smt\-checker         | 0                                         | 0    | 18   | 0    | 0\.41        |
| solc\-verify         | 13                                        | 5    | 0    | 0    | 11\.88       |
| storage \(27\)       | correct incorrect unsupported timeout     |      |      |      | time \(s\)   |
| mythril              | 27                                        | 0    | 0    | 0    | 310\.4       |
| verisol              | 12                                        | 15   | 0    | 0    | 43\.45       |
| smt\-checker         | 2                                         | 0    | 25   | 0    | 1\.32        |
| solc\-verify         | 27                                        | 0    | 0    | 0    | 17\.61       |
| storageptr \(164\)   | correct incorrect unsupported timeout     |      |      |      | time \(s\)   |
| mythril              | 164                                       | 0    | 0    | 0    | 1520\.29     |
| verisol              | 128                                       | 19   | 17   | 0    | 203\.93      |
| smt\-checker         | 4                                         | 18   | 142  | 0    | 21\.93       |
| solc\-verify         | 164                                       | 0    | 0    | 0    | 96\.92       |
