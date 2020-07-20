const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];

    it('can add the star name and star symbol properly', () => {
        let notary;
        let name = 'Awesome Star';
        let symbol = 'AWE';
        let tokenId = 20;

        StarNotary.deployed()
        .then(instance => {
            notary = instance;
            notary.createStar(name, symbol, tokenId, { from: owner });
        })
        .then(() => notary.lookUptokenIdToStarInfo.call(tokenId))
        .then(starName => assert.equal(starName, name))
        .then(() => notary.getStarSymbol.call(tokenId))
        .then(tokenSymbol => assert.equal(tokenSymbol, symbol));
    });

    it('lets 2 users exchange stars', () => {
        let notary;
        let acct1 = accounts[0];
        let acct2 = accounts[1];
        let star1Name = 'Awesome Star for acct 1', star1Symbol = 'AWE', star1TokenId = 23;
        let star2Name = 'Awesome Star for acct 2', star2Symbol = 'AWE', star2TokenId = 24;

        StarNotary.deployed()
            .then(instance => {
                notary = instance;
                notary.createStar(star1Name, star1Symbol, star1TokenId, { from: acct1 });
                notary.createStar(star2Name, star2Symbol, star2TokenId, { from: acct2 });
            })
            .then(() => notary.exchangeStars(star1TokenId, star2TokenId, { from: acct1 }))
            .then(() => notary.getOwnerOfStar.call(star1TokenId))
            .then(star1Owner => assert.equal(star1Owner, acct2))
            .then(() => notary.getOwnerOfStar.call(star2TokenId))
            .then(star2Owner => {
                assert.equal(star2Owner, acct1);
                return star2Owner;
            })
            .then(star2Owner => assert.notEqual(star2Owner, acct2));
    });

    it('lets a user transfer a star', () => {
        let notary;
        let source = accounts[0];
        let destination = accounts[1];
        let name = 'Awesome Star', symbol = 'AWE', tokenId = 25;

        StarNotary.deployed()
            .then(instance => {
                notary = instance;
                notary.createStar(name, symbol, tokenId, { from: source });
            })
            .then(() => notary.transferStar(destination, tokenId, { from: source }))
            .then(() => notary.getOwnerOfStar.call(tokenId))
            .then(starOwner => {
                assert.equal(starOwner, destination);
                return starOwner;
            })
            .then(starOwner => assert.notEqual(starOwner, source));
    });

    it('lookUptokenIdToStarInfo test', () => {
        let notary;
        let name = 'Awesome Starry Star', symbol = 'STS', tokenId = 26;

        StarNotary.deployed()
            .then(instance => {
                notary = instance;
                notary.createStar(name, symbol, tokenId, { from: owner })
            })
            .then(() => notary.lookUptokenIdToStarInfo.call(tokenId))
            .then(starName => assert.equal(starName, name));
    });
    
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', 'AWE', tokenId, {from: accounts[0]})
    assert.equal(await instance.lookUptokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', 'AWE', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWE', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWE', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWE', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', () => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided

});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
});