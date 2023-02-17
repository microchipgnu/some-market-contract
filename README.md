SOME Marketplace ⚠️ 
==================

SOME (Simply Offer MarketplacE) is a contract that facilitates the exchange of Non-fungible Tokens (NFTs) and Fungible Tokens (FTs). The contract leverages NEAR Social as a notification system to keep both parties informed throughout the exchange process.

- [Near Social Live Demo](https://test.near.social/#/luisf.testnet/widget/some-market)
- [Live Contract](https://testnet.nearblocks.io/address/dev-1676391043857-14814706623603)

## Features

1. Leverages Near Social notification system to notify involved parties.
2. Implements Mintbase AffiliateDirect standard. 

## Process

The exchange process is divided into three steps: creating an offer, accepting an offer, and exchanging FT for NFT. 

The first step involves the offerer (A) creating an offer in the market contract (MC) and notifying the NFT token owner (B) of the offer via the NEAR Social contract (NSC). 

In the second step, the NFT token owner (B) approves the offer and the MC writes a notification to the offerer (A) via NSC. 

Finally, in the third step, the offerer (A) transfers FT to the market contract (MC), which then attempts to transfer the NFT to the offerer (A) and the FT to the NFT token owner (B).

### Creating an offer

1. **A** calls `make_offer` to create an offer in **MC**.
2. **MC** calls `XXX` to write a notification in **NSC**. This notifies **B** that an offer was created.

### Accepting an offer

1. **B** calls `nft_approve` on **NFT** targetting **MC**. This triggers `nft_on_approve` on **MC**.
2. **MC** calls `XXX` to write a notification on **NSC** notifying **A** that the offer was accepted.

```sh
near call nft nft_approve '{
   "token_id": "1",
   "account_id": "market",
   "msg": "{\"offer_id\": \"XYZ\"}"
 }' --accountId A --depositYocto 1
```

### Exchanging the NFT

1. **A** calls `buy` on **MC**

```sh
near call market buy '{
   "offer_id": "XYZ" 
 }' --accountId B --depositYocto offer_amount
```

## Future

- [ ] Implement storage staking when creating offers to avoid spam / running out of storage.
- [ ] CI/CD workflow similar to [DevGigsBoard](https://github.com/near/devgigsboard-widgets/blob/main/.github/workflows/release.yml) for Near Social widgets
- [ ] Implement Near Social Notifications contract or methods within this contract
- [ ] Implement AffiliateDirect event logs (Mintbase Standard)
