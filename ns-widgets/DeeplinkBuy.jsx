const market_contract_id = "dev-1676391043857-14814706623603";
const offer_id = props.offer_id;

const offer = Near.view(market_contract_id, "get_offer_by_id", {
  offer_id: offer_id,
});

const handleBuy = () => {
  Near.call({
    contractName: market_contract_id,
    methodName: "buy",
    args: {
      offer_id: offer_id,
    },
    gas: 300000000000000,
    deposit: offer.amount,
  });
};

handleBuy();

return <div></div>;