pragma solidity >=0.6.12 <0.7.0;

struct Query
{
    uint id;
    function(uint, bytes memory) external callback;
}

contract SimpleOracle
{
    event Queried(bytes,function(uint, bytes memory) external);

    Query[] public queries;
    uint public price;
    address immutable owner = msg.sender;

    modifier onlyowner { require(msg.sender == owner); _; }

    function query(bytes calldata q, function(uint, bytes memory) external callback) public payable returns (uint id) {
        require(msg.value == price);
        id = queries.length;
        queries.push(Query(id, callback));
        emit Queried(q, callback);
    }

    function resolve(uint id, bytes calldata response) onlyowner public {
        Query memory q = queries[id];
        delete queries[id];
        q.callback(id, response);
    }

    function withdraw() onlyowner public {
        msg.sender.transfer(address(this).balance);
    }
    function setPrice(uint _price) onlyowner public {
        price = _price;
    }
}
