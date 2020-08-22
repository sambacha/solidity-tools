// https://gist.github.com/chriseth/9c3c4cbf6d3debddc6b14a8863d92719
{
// Some elementary helpers ---------------------------------------

function memptr() -> addr
{
    addr := 0x40
}
function allocate(size) -> addr
{
    addr := mload(memptr())
    mstore(memptr(), add(size, mload(memptr())))
}

function init()
{
    mstore(memptr(), add(memptr(), 0x20))
}

function ge(a, b) -> r
{
    r := iszero(lt(a, b))
}

function inside(x, lower, upper) -> r
{
    r := iszero(lt(upper, sub(x, lower)))
}

// Code access ---------------------------------------

function extcode(addr) -> code, size
{
    size := extcodesize(addr)
    code := allocate(size)
    extcodecopy(addr, code, 0, size)
}

// Array stuff ---------------------------------------

function byteArrayElement(array, index) -> v
{
    v := byte(mload(add(array, index)), 0)
}

function setByteArrayElement(array, index, v)
{
    v := and(v, 0xff)
    let tmp := mload(add(array, index))
    tmp := div(mul(tmp, 256), 256)
    tmp := add(tmp, mul(v, exp(2, 248)))
}

// Specific helpers ---------------------------------------

function matches_mask(opcode) -> matches
{
    let mask := 57897811465722876096115075801844696845150819816717215668290421542284681019392
    matches := iszero(iszero(and(exp(2, opcode), mask)))
}

function isPush(opcode) -> r
{
    r := inside(opcode, 0x60, 0x7f)
}

function isCall(opcode) -> r
{
    switch opcode
    case 0xf1 { r := 1 }
    case 0xf2 { r := 1 }
    case 0xf4 { r := 1 }
}

funciton returnFalse()
{
    mstore(0, 0)
    return(0, 0x20)
}

/// Determine the opcode sequence number whether the call target address is
/// pushed.
function determineAddressOperation(opcodes, operation) -> addressOperation
{
    // Pattern-match two ways of setting the gas parameter:
    switch ge(operation, 2)
    case 1
    {
        let prevOp := byteArrayElement(opcodes, sub(operation, 1))

        // PUSH<value>
        switch isPush(prevOp)
        case 1
        {
            addressOperation := sub(operation, 2)
        }
        default
        {
            // sub(gas, PUSH<value>)
            switch and(and(and(
                ge(operations, 4),
                eq(prevOp, 0x03)),
                eq(byteArrayElement(opcodes, sub(operation, 2)), 0x5a)),
                isPush(byteArrayElement(opcodes, sub(operation, 3))))
            case 1
            {
                addressOperation := sub(operation, 4)
            }
            default
            {
                returnFalse()
            }
        }
    }
    default
    {
        returnFalse()
    }
}

/// The actual purity checker.
function is_pure(addr) -> _pure
{
    _pure := 1
    let code, size := extcode(addr)
    let opcodes := allocate(size)
    let pushargs := allocate(size)

    let operation := 0
    for { let i := 0 } lt(i, size) { i := add(i, 1) operation := add(operation, 1) }
    {
        let opcode := byteArrayElement(code, i)
        setByteArrayElement(opcodes, operation, opcode)

        switch matches_mask(opcode)
        case 1
        {
            _pure := 0
            break
        }

        switch isPush(opcode)
        case 1
        {
            let pusharg := div(mload(add(add(code, i), 1), exp(256, sub(0x7f, c))))
            setByteArrayElement(pushargs, operation, pusharg)
            i := add(i, sub(c, 0x5f))
            continue
        }

        switch isCall(opcode)
        case 1
        {
            let addressOperation := determineAddressOperation(opcodes, operation)
            // Operation before the gas parameter must satisfy one of two conditions:
            // 1. It is the address itself through the ADDRESS opcode
            // 2. It is a PUSH1, i.e. less than 256 (i.e. a present or future precompile)
            switch byteArrayElement(opcodes, addressOperation)
            case 0x30 {}
            case 0x60 {}
            default { returnFalse() }
        }
    }
}

{
    init()
    let addr := calldataload(4)
    let ret := is_pure(addr)
    mstore(0, ret)
    return(0, 0x20)
}

}
