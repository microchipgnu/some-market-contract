const market_contract_id = "dev-1676391043857-14814706623603";

State.init({
  list_token_id: "",
  list_nft_contract_id: "",
  list_affiliate_id: "",
  list_amount: "",
  accept_offer_id: "",
  offer_id: "",
  deposit: "",
});

const handleCreateOffer = () => {
  const _price = Number(
    Number(new Big(state.list_amount).mul(new Big(10).pow(24)).toString())
  )
    .toLocaleString()
    .replace(/,/g, "");

  Near.call({
    contractName: market_contract_id,
    methodName: "make_offer",
    args: {
      token_id: state.list_token_id,
      nft_contract_id: state.list_nft_contract_id,
      referrer_id: state.list_affiliate_id || null,
      amount: _price,
    },
    gas: 200000000000000,
    deposit: 0,
  });
};

const offer = Near.view(market_contract_id, "get_offer_by_id", {
  offer_id: state.accept_offer_id || state.offer_id,
});

State.update({
  offer: offer,
});

const handleAcceptOffer = () => {
  Near.call({
    contractName: offer.nft_contract_id,
    methodName: "nft_approve",
    args: {
      token_id: offer.token_id,
      account_id: market_contract_id,
      msg: JSON.stringify({ offer_id: state.accept_offer_id }),
    },
    gas: 200000000000000,
    deposit: "800000000000000000000",
  });
};

const handleBuy = () => {
  Near.call({
    contractName: market_contract_id,
    methodName: "buy",
    args: {
      offer_id: state.offer_id,
    },
    gas: 200000000000000,
    deposit: offer.amount,
  });
};

return (
  <div class="d-flex flex-column gap-4">
    <div>
      <h4>Create Offer</h4>
      <div class="d-flex flex-column gap-1">
        <input
          type="text"
          value={state.list_token_id}
          placeholder="Token Id"
        ></input>
        <input
          type="text"
          value={state.list_nft_contract_id}
          placeholder="Contract Id"
        ></input>
        <input
          type="text"
          value={state.list_affiliate_id}
          placeholder="Affiliate Id"
        ></input>
        <input
          type="text"
          value={state.list_amount}
          placeholder="Amount"
        ></input>
        <button onClick={() => handleCreateOffer()}>Create Offer</button>
      </div>
    </div>
    <div>
      <h4>Accept Offer (Approve)</h4>
      <div class="d-flex flex-column gap-1">
        <input
          type="text"
          value={state.accept_offer_id}
          placeholder="Offer Id"
        ></input>
        <button onClick={() => handleAcceptOffer()}>Accept Offer</button>
      </div>
    </div>
    <div>
      <h4>Buy</h4>
      <div class="d-flex flex-column gap-1">
        <input
          type="text"
          value={state.offer_id}
          placeholder="Offer Id"
        ></input>
        <button onClick={() => handleBuy()}>Buy</button>
      </div>
    </div>
  </div>
);