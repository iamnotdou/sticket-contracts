import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  AssembledTransactionOptions,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBBF6CHQTD2KPFI5VQ5BT7LHPPWXGHEAGMTJ3OUZ74TVD6DCJMWN4F4V",
  }
} as const

export type DataKey = {tag: "EventInfo", values: void} | {tag: "Ticket", values: readonly [u32]} | {tag: "TicketsMinted", values: void} | {tag: "SecondaryListing", values: readonly [u32]} | {tag: "UserTickets", values: readonly [string]};


export interface EventInfo {
  creator_fee_bps: u32;
  event_creator: string;
  event_metadata: string;
  name: string;
  payment_token: string;
  primary_price: i128;
  symbol: string;
  total_supply: u32;
}


export interface TicketData {
  is_used: boolean;
  owner: string;
  ticket_id: u32;
}


export interface SecondaryListing {
  price: i128;
  seller: string;
  ticket_id: u32;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the ticket marketplace contract
   */
  init: ({event_creator, total_supply, primary_price, creator_fee_bps, event_metadata, name, symbol, payment_token}: {event_creator: string, total_supply: u32, primary_price: i128, creator_fee_bps: u32, event_metadata: string, name: string, symbol: string, payment_token: string}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a name transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the name of the event/ticket collection
   */
  name: (options?: AssembledTransactionOptions<string>) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a symbol transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the symbol of the ticket
   */
  symbol: (options?: AssembledTransactionOptions<string>) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get ticket information
   */
  get_ticket: ({ticket_id}: {ticket_id: u32}, options?: AssembledTransactionOptions<TicketData>) => Promise<AssembledTransaction<TicketData>>

  /**
   * Construct and simulate a list_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * List ticket on secondary marketplace
   */
  list_ticket: ({seller, ticket_id, price}: {seller: string, ticket_id: u32, price: i128}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a mint_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mint a ticket from primary marketplace (buy from event creator)
   */
  mint_ticket: ({buyer}: {buyer: string}, options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a delist_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Delist ticket from secondary marketplace
   */
  delist_ticket: ({seller, ticket_id}: {seller: string, ticket_id: u32}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_event_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get event information
   */
  get_event_info: (options?: AssembledTransactionOptions<EventInfo>) => Promise<AssembledTransaction<EventInfo>>

  /**
   * Construct and simulate a transfer_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer ticket directly (P2P)
   */
  transfer_ticket: ({from, to, ticket_id}: {from: string, to: string, ticket_id: u32}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_user_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get tickets owned by user
   */
  get_user_tickets: ({user}: {user: string}, options?: AssembledTransactionOptions<Array<u32>>) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a mark_ticket_used transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mark ticket as used (check-in at event)
   */
  mark_ticket_used: ({creator, ticket_id}: {creator: string, ticket_id: u32}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_tickets_minted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get number of tickets minted
   */
  get_tickets_minted: (options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a buy_secondary_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buy ticket from secondary marketplace
   */
  buy_secondary_ticket: ({buyer, ticket_id}: {buyer: string, ticket_id: u32}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a update_listing_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update listing price
   */
  update_listing_price: ({seller, ticket_id, new_price}: {seller: string, ticket_id: u32, new_price: i128}, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_secondary_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get secondary listing
   */
  get_secondary_listing: ({ticket_id}: {ticket_id: u32}, options?: AssembledTransactionOptions<Option<SecondaryListing>>) => Promise<AssembledTransaction<Option<SecondaryListing>>>

  /**
   * Construct and simulate a get_tickets_available transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get number of tickets available in primary market
   */
  get_tickets_available: (options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_all_secondary_listings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all secondary listings
   */
  get_all_secondary_listings: (options?: AssembledTransactionOptions<Array<SecondaryListing>>) => Promise<AssembledTransaction<Array<SecondaryListing>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAACUV2ZW50SW5mbwAAAAAAAAEAAAAAAAAABlRpY2tldAAAAAAAAQAAAAQAAAAAAAAAAAAAAA1UaWNrZXRzTWludGVkAAAAAAAAAQAAAAAAAAAQU2Vjb25kYXJ5TGlzdGluZwAAAAEAAAAEAAAAAQAAAAAAAAALVXNlclRpY2tldHMAAAAAAQAAABM=",
        "AAAAAQAAAAAAAAAAAAAACUV2ZW50SW5mbwAAAAAAAAgAAAAAAAAAD2NyZWF0b3JfZmVlX2JwcwAAAAAEAAAAAAAAAA1ldmVudF9jcmVhdG9yAAAAAAAAEwAAAAAAAAAOZXZlbnRfbWV0YWRhdGEAAAAAABAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAA1wYXltZW50X3Rva2VuAAAAAAAAEwAAAAAAAAANcHJpbWFyeV9wcmljZQAAAAAAAAsAAAAAAAAABnN5bWJvbAAAAAAAEAAAAAAAAAAMdG90YWxfc3VwcGx5AAAABA==",
        "AAAAAQAAAAAAAAAAAAAAClRpY2tldERhdGEAAAAAAAMAAAAAAAAAB2lzX3VzZWQAAAAAAQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAl0aWNrZXRfaWQAAAAAAAAE",
        "AAAAAAAAACpJbml0aWFsaXplIHRoZSB0aWNrZXQgbWFya2V0cGxhY2UgY29udHJhY3QAAAAAAARpbml0AAAACAAAAAAAAAANZXZlbnRfY3JlYXRvcgAAAAAAABMAAAAAAAAADHRvdGFsX3N1cHBseQAAAAQAAAAAAAAADXByaW1hcnlfcHJpY2UAAAAAAAALAAAAAAAAAA9jcmVhdG9yX2ZlZV9icHMAAAAABAAAAAAAAAAOZXZlbnRfbWV0YWRhdGEAAAAAABAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAZzeW1ib2wAAAAAABAAAAAAAAAADXBheW1lbnRfdG9rZW4AAAAAAAATAAAAAA==",
        "AAAAAAAAACtHZXQgdGhlIG5hbWUgb2YgdGhlIGV2ZW50L3RpY2tldCBjb2xsZWN0aW9uAAAAAARuYW1lAAAAAAAAAAEAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAEFNlY29uZGFyeUxpc3RpbmcAAAADAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAJdGlja2V0X2lkAAAAAAAABA==",
        "AAAAAAAAABxHZXQgdGhlIHN5bWJvbCBvZiB0aGUgdGlja2V0AAAABnN5bWJvbAAAAAAAAAAAAAEAAAAQ",
        "AAAAAAAAABZHZXQgdGlja2V0IGluZm9ybWF0aW9uAAAAAAAKZ2V0X3RpY2tldAAAAAAAAQAAAAAAAAAJdGlja2V0X2lkAAAAAAAABAAAAAEAAAfQAAAAClRpY2tldERhdGEAAA==",
        "AAAAAAAAACRMaXN0IHRpY2tldCBvbiBzZWNvbmRhcnkgbWFya2V0cGxhY2UAAAALbGlzdF90aWNrZXQAAAAAAwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAl0aWNrZXRfaWQAAAAAAAAEAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAA",
        "AAAAAAAAAD9NaW50IGEgdGlja2V0IGZyb20gcHJpbWFyeSBtYXJrZXRwbGFjZSAoYnV5IGZyb20gZXZlbnQgY3JlYXRvcikAAAAAC21pbnRfdGlja2V0AAAAAAEAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAEAAAAE",
        "AAAAAAAAAChEZWxpc3QgdGlja2V0IGZyb20gc2Vjb25kYXJ5IG1hcmtldHBsYWNlAAAADWRlbGlzdF90aWNrZXQAAAAAAAACAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAACXRpY2tldF9pZAAAAAAAAAQAAAAA",
        "AAAAAAAAABVHZXQgZXZlbnQgaW5mb3JtYXRpb24AAAAAAAAOZ2V0X2V2ZW50X2luZm8AAAAAAAAAAAABAAAH0AAAAAlFdmVudEluZm8AAAA=",
        "AAAAAAAAAB5UcmFuc2ZlciB0aWNrZXQgZGlyZWN0bHkgKFAyUCkAAAAAAA90cmFuc2Zlcl90aWNrZXQAAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAl0aWNrZXRfaWQAAAAAAAAEAAAAAA==",
        "AAAAAAAAABlHZXQgdGlja2V0cyBvd25lZCBieSB1c2VyAAAAAAAAEGdldF91c2VyX3RpY2tldHMAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAPqAAAABA==",
        "AAAAAAAAACdNYXJrIHRpY2tldCBhcyB1c2VkIChjaGVjay1pbiBhdCBldmVudCkAAAAAEG1hcmtfdGlja2V0X3VzZWQAAAACAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAACXRpY2tldF9pZAAAAAAAAAQAAAAA",
        "AAAAAAAAABxHZXQgbnVtYmVyIG9mIHRpY2tldHMgbWludGVkAAAAEmdldF90aWNrZXRzX21pbnRlZAAAAAAAAAAAAAEAAAAE",
        "AAAAAAAAACVCdXkgdGlja2V0IGZyb20gc2Vjb25kYXJ5IG1hcmtldHBsYWNlAAAAAAAAFGJ1eV9zZWNvbmRhcnlfdGlja2V0AAAAAgAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAl0aWNrZXRfaWQAAAAAAAAEAAAAAA==",
        "AAAAAAAAABRVcGRhdGUgbGlzdGluZyBwcmljZQAAABR1cGRhdGVfbGlzdGluZ19wcmljZQAAAAMAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAJdGlja2V0X2lkAAAAAAAABAAAAAAAAAAJbmV3X3ByaWNlAAAAAAAACwAAAAA=",
        "AAAAAAAAABVHZXQgc2Vjb25kYXJ5IGxpc3RpbmcAAAAAAAAVZ2V0X3NlY29uZGFyeV9saXN0aW5nAAAAAAAAAQAAAAAAAAAJdGlja2V0X2lkAAAAAAAABAAAAAEAAAPoAAAH0AAAABBTZWNvbmRhcnlMaXN0aW5n",
        "AAAAAAAAADFHZXQgbnVtYmVyIG9mIHRpY2tldHMgYXZhaWxhYmxlIGluIHByaW1hcnkgbWFya2V0AAAAAAAAFWdldF90aWNrZXRzX2F2YWlsYWJsZQAAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAABpHZXQgYWxsIHNlY29uZGFyeSBsaXN0aW5ncwAAAAAAGmdldF9hbGxfc2Vjb25kYXJ5X2xpc3RpbmdzAAAAAAAAAAAAAQAAA+oAAAfQAAAAEFNlY29uZGFyeUxpc3Rpbmc=" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        name: this.txFromJSON<string>,
        symbol: this.txFromJSON<string>,
        get_ticket: this.txFromJSON<TicketData>,
        list_ticket: this.txFromJSON<null>,
        mint_ticket: this.txFromJSON<u32>,
        delist_ticket: this.txFromJSON<null>,
        get_event_info: this.txFromJSON<EventInfo>,
        transfer_ticket: this.txFromJSON<null>,
        get_user_tickets: this.txFromJSON<Array<u32>>,
        mark_ticket_used: this.txFromJSON<null>,
        get_tickets_minted: this.txFromJSON<u32>,
        buy_secondary_ticket: this.txFromJSON<null>,
        update_listing_price: this.txFromJSON<null>,
        get_secondary_listing: this.txFromJSON<Option<SecondaryListing>>,
        get_tickets_available: this.txFromJSON<u32>,
        get_all_secondary_listings: this.txFromJSON<Array<SecondaryListing>>
  }
}