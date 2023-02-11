import {
  call,
  LookupMap,
  NearBindgen,
  PromiseOrValue,
  near,
  initialize,
  view,
  assert,
  NearPromise,
  bytes,
} from "near-sdk-js";

const NEAR_SOCIAL_CONTRACT_ID_DEFAULT = "v1.social08.testnet";

class Offer {
  token_id: string;
  nft_contract_id: string;
  amount: bigint;
  creator_account_id: string;

  affiliate_id?: string;

  constructor(
    token_id: string,
    nft_contract_id: string,
    amount: bigint,
    account_id: string,
    affiliate_id?: string
  ) {
    this.affiliate_id = affiliate_id;
    this.amount = amount;
    this.nft_contract_id = nft_contract_id;
    this.creator_account_id = account_id;
    this.token_id = token_id;
  }
}

@NearBindgen({ requireInit: true })
class Market {
  offers: LookupMap<Offer>;
  approval_ids: LookupMap<bigint>;
  near_social_account_id: string;

  constructor() {
    this.offers = new LookupMap<Offer>("o");
    this.approval_ids = new LookupMap<bigint>("a");
    this.near_social_account_id = NEAR_SOCIAL_CONTRACT_ID_DEFAULT;
  }

  @initialize({})
  init() {}

  @view({})
  get_offer_token_contract_id({ offer_id }: { offer_id: string }) {
    return this.offers.get(offer_id);
  }

  @call({})
  make_offer({
    token_id,
    nft_contract_id,
    affiliate_id,
    amount,
  }: {
    token_id: string;
    nft_contract_id: string;
    ft_account_id: string;
    amount: bigint;
    affiliate_id?: string;
  }): PromiseOrValue<string> {
    const accountId = near.predecessorAccountId();

    const offer_id = `${token_id}:${nft_contract_id}:${accountId}`;

    const offer = new Offer(
      token_id,
      nft_contract_id,
      amount,
      accountId,
      affiliate_id
    );

    this.offers.set(offer_id, offer);

    // TODO: notify token owner of new offer

    return offer_id;
  }

  // TODO: implement near social notification
  // @call({ privateFunction: true })
  // near_social_notification({ account_ids }: { account_ids: string[] }): void {}

  // This method is called by nft contract upon token approval via `nft_approve`
  @call({})
  nft_on_approve({
    token_id,
    owner_id,
    approval_id,
    msg,
  }: {
    token_id: string;
    owner_id: string;
    approval_id: bigint;
    msg: string;
  }): Promise<boolean> {
    const parsed_message = JSON.parse(msg);

    const { offer_id } = parsed_message;

    this.approval_ids.set(offer_id, approval_id);

    // TODO: implement near social offer
    // near_social_notification()
    return;
  }

  @call({ payableFunction: true })
  buy({ offer_id }: { offer_id: string }) {
    const account_id = near.predecessorAccountId();

    const {
      amount,
      creator_account_id,
      nft_contract_id,
      token_id,
      affiliate_id,
    } = this.offers.get(offer_id);

    const approval_id = this.approval_ids.get(offer_id);

    const deposit = near.attachedDeposit().valueOf();
    const price = BigInt(amount);

    assert(
      price === deposit,
      `Offer amount differs from what was actually deposited.`
    );

    assert(
      account_id === creator_account_id,
      `Sender ID differs from Offerer ID.`
    );

    // TODO: remove offer from map

    const promise = near.promiseBatchCreate(nft_contract_id);
    near.promiseBatchActionFunctionCall(
      promise,
      "nft_transfer_payout",
      bytes(
        JSON.stringify({
          receiver_id: account_id,
          token_id: token_id,
          approval_id: approval_id,
          memo: "payout from market",
          balance: amount,
          max_len_payout: 20,
        })
      ),
      BigInt("1"),
      BigInt("150000000000000")
    );

    near.promiseThen(
      promise,
      near.currentAccountId(),
      "internal_resolve_purchase",
      bytes(
        JSON.stringify({
          buyer_id: account_id,
          price: amount,
        })
      ),
      0,
      115_000_000_000_000
    );
    return near.promiseReturn(promise);
  }

  @call({ privateFunction: true })
  internal_resolve_purchase({
    buyerId,
    price,
  }: {
    buyerId: string;
    price: string;
  }) {
    assert(
      near.currentAccountId() === near.predecessorAccountId(),
      "Only the contract itself can call this method"
    );

    let result = near.promiseResult(0);
    let payout = null;

    if (typeof result === "string") {
      try {
        let payoutOption = JSON.parse(result);
        if (
          Object.keys(payoutOption.payout).length > 10 ||
          Object.keys(payoutOption.payout).length < 1
        ) {
          throw "Cannot have more than 10 royalties";
        } else {
          let remainder = BigInt(price);
          Object.entries(payoutOption.payout).forEach(([key, value], index) => {
            remainder = remainder - BigInt(value as string);
          });

          if (remainder == BigInt(0) || remainder == BigInt(1)) {
            payout = payoutOption.payout;
          } else {
            throw "Payout is not correct";
          }
        }
      } catch (e) {
        near.log(`error parsing payout object ${result}`);
        payout = null;
      }
    }

    if (payout == null) {
      const promise = near.promiseBatchCreate(buyerId);
      near.promiseBatchActionTransfer(promise, BigInt(price));
      return price;
    }

    for (let [key, value] of Object.entries(payout)) {
      const promise = near.promiseBatchCreate(key);
      near.promiseBatchActionTransfer(promise, BigInt(value as string));
    }

    return price;
  }
}
