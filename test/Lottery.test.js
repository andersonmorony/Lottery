const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');

const web3 = new Web3(ganache.provider());
const {interface, bytecode } = require('../compile');

let accounts;
let lottery;
let manager;
let players;

beforeEach( async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
                .deploy({data: bytecode, arguments: [] })
                .send({ gas: 1000000, gasPrice: 5000000000, from: accounts[0] });

});

describe('Lottery', () => {

    it('Should Created Contract', async () => {
        assert.ok(lottery.options.address);
    });

    it('Should Get All Players', async () => {
        players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        
        assert.ok(players);
    })

    it('Should Enter Player', async () => {
        await lottery.methods.enter().send({ 
            from: accounts[0], 
            value: web3.utils.toWei('0.2', 'ether')
        });
        
        players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        
        assert.equal(players[0], accounts[0]);
        assert.equal(1, players.length);
    });

    it('Should PickWinner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.2', 'ether')
        });

        await lottery.methods.pickWinner().send({from: accounts[0]});
        
        players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        
        assert.deepEqual(players, []);
    });



})