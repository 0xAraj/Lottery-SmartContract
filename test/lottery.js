const Lottery = artifacts.require("Lottery.sol");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("Lottery", (accounts) => {
  let lottery;
  before(async () => {
    lottery = await Lottery.deployed();
  });

  it("should set manager", async () => {
    const manager = await lottery.manager();
    assert(manager == accounts[0]);
  });

  it("should register participants", async () => {
    await lottery.participate({
      from: accounts[1],
      value: 2000000000000000000,
    });
    const noOfParticipants = await lottery.noOfParticipants();
    const participateAddress = await lottery.participants([0]);
    assert(noOfParticipants.toNumber() == 1);
    assert(participateAddress == accounts[1]);
  });

  it("should not register if it is manager", async () => {
    await expectRevert(
      lottery.participate({ from: accounts[0], value: 2000000000000000000 }),
      "Manager can not participate"
    );
  });

  it("should not register if participation amount is exact", async () => {
    await expectRevert(
      lottery.participate({ from: accounts[2], value: 1000000000000000000 }),
      "Participation fee is 2 ether"
    );
  });

  it("should not select winner if participants are less than 3", async () => {
    await expectRevert(
      lottery.selectWinner(),
      "At least 3 participants require"
    );
  });

  it("should not select winner if not manager", async () => {
    await expectRevert(
      lottery.selectWinner({ from: accounts[1] }),
      "Only manager is allowed"
    );
  });

  // to pass below test case make noOfParticipants = 1 then it will be easy to check transfer is made or not and do comment test that is checking noOfParticipants because require will pass and test will fail;

  it("should select winner and transfer funds", async () => {
    const initialBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );
    await lottery.selectWinner({ from: accounts[0] });
    const finalBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );
    const transferedAmount = finalBalance.sub(initialBalance);
    assert(transferedAmount == 2000000000000000000);
  });
});
