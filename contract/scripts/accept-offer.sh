echo ">> Accepting offer..."

near call newico2.mintspace2.testnet nft_approve '{"token_id": "164", "account_id": "dev-1675985149682-61415912272470", "msg": "{\"offer_id\": \"164:newico2.mintspace2.testnet:ruitestnet.testnet\"}"}' --accountId account2.testnet --depositYocto 800000000000000000000 --gas 300000000000000


