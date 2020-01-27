pragma solidity ^0.5.0;

contract Mwika {
  string mwikaHash;

  function set(string memory _mwikaHash) public {
    mwikaHash = _mwikaHash;
  }

  function get() public view returns(string memory) {
    return mwikaHash;
  }
}
