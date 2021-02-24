const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const {abi, bytecode} = require('../compile');
const web3 = new Web3(ganache.provider());

let accounts;
let lottery;

beforeEach(async ()=>{
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(abi)
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: '1000000', gasPrice: '100000'});
});

describe("Lottery Contract Tests:",()=>{
    
    it("Deploy test",()=>{
        assert.ok(lottery.options.address);
    });

    it("Single Player Entry Test",async()=>{
        await lottery.methods.enter().send({
            from: accounts[1], 
            value: web3.utils.toWei('0.01', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({from: accounts[0]});
        assert.strictEqual(players[0],accounts[1]);
        assert.strictEqual(players.length,1);
    });
    
    it("Multiple Player Entry Test",async()=>{
        await lottery.methods.enter().send({
            from: accounts[0], 
            value: web3.utils.toWei('0.01', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1], 
            value: web3.utils.toWei('0.05', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2], 
            value: web3.utils.toWei('1', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({from: accounts[0]});
        assert.strictEqual(players[0],accounts[0]);
        assert.strictEqual(players[1],accounts[1]);
        assert.strictEqual(players[2],accounts[2]);
        assert.strictEqual(players.length,3);
    });

    it("Minimum amount to enter lottery test", async()=>{
        try{
            await lottery.methods.enter().send({
                from: accounts[2], 
                value: web3.utils.toWei('0.00001', 'ether')
            });
            assert.fail();
        } catch(err){
            if(err.name == "AssertionError [ERR_ASSERTION]"){
                assert.fail("Test failed");
            }
            assert.ok(true);
        }
    });

    it("Only manager can access test", async ()=>{
        try{
            await lottery.methods.pickWinner().send({from: accounts[1]});
            assert.fail();
        } catch(err){
            if(err.name == "AssertionError [ERR_ASSERTION]"){
                assert.fail("Test failed");
            }
            assert.ok(true);
        }
    });
    
    it("Full contract test",async()=>{
        await lottery.methods.enter().send({
            from:accounts[0],
            value: web3.utils.toWei('1','ether')
        });
        const initBal = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from:accounts[0]
        });
        const finBal = await web3.eth.getBalance(accounts[0]);
        // console.log(finBal-initBal);
        assert(finBal-initBal> web3.utils.toWei("0.8","ether"));
    });
});
