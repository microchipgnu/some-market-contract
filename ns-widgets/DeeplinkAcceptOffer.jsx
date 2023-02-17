const market_contract_id = "dev-1676391043857-14814706623603";
const offer_id = props.offer_id;

const offer = Near.view(market_contract_id, "get_offer_by_id", {
  offer_id: offer_id,
});

const handleAcceptOffer = () => {
  Near.call({
    contractName: offer.nft_contract_id,
    methodName: "nft_approve",
    args: {
      token_id: offer.token_id,
      account_id: market_contract_id,
      msg: JSON.stringify({ offer_id: offer_id }),
    },
    gas: 200000000000000,
    deposit: "800000000000000000000",
  });
};

handleAcceptOffer();

return <div></div>;