const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');

const web3 = new Web3(ganache.provider());
const {interface, bytecode } = require('../compile');

let accounts;
let lottery;
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

    it('Should Enter one Player', async () => {
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

    it('Should Enter multiple Player', async () => {
        await lottery.methods.enter().send({ 
            from: accounts[0], 
            value: web3.utils.toWei('0.2', 'ether')
        });

        await lottery.methods.enter().send({ 
            from: accounts[1], 
            value: web3.utils.toWei('0.2', 'ether')
        });

        await lottery.methods.enter().send({ 
            from: accounts[2], 
            value: web3.utils.toWei('0.2', 'ether')
        });
        
        players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        
        assert.equal(players[0], accounts[0]);
        assert.equal(players[1], accounts[1]);
        assert.equal(players[2], accounts[2]);
        assert.equal(3, players.length);
    });

    it('should required a minimum amount of ether to enter', async () => {
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });

            assert(false);

        } catch (err) {
            assert(err);
        }
    });

    it('Should PickWinner and send value to the winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from: accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        
        players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert(difference > web3.utils.toWei('1.8', 'ether'));
        assert.deepEqual(players, []);
    });

    it('Should only manager can call pickWinner', async () => {
        try{

            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });

            assert(false);

        } catch (err) {
            assert(err);
        }
    })



})