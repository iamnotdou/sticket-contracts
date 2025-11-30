import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, i128, AssembledTransactionOptions, Option } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBBF6CHQTD2KPFI5VQ5BT7LHPPWXGHEAGMTJ3OUZ74TVD6DCJMWN4F4V";
    };
};
export type DataKey = {
    tag: "EventInfo";
    values: void;
} | {
    tag: "Ticket";
    values: readonly [u32];
} | {
    tag: "TicketsMinted";
    values: void;
} | {
    tag: "SecondaryListing";
    values: readonly [u32];
} | {
    tag: "UserTickets";
    values: readonly [string];
};
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
    init: ({ event_creator, total_supply, primary_price, creator_fee_bps, event_metadata, name, symbol, payment_token }: {
        event_creator: string;
        total_supply: u32;
        primary_price: i128;
        creator_fee_bps: u32;
        event_metadata: string;
        name: string;
        symbol: string;
        payment_token: string;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a name transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the name of the event/ticket collection
     */
    name: (options?: AssembledTransactionOptions<string>) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a symbol transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the symbol of the ticket
     */
    symbol: (options?: AssembledTransactionOptions<string>) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get ticket information
     */
    get_ticket: ({ ticket_id }: {
        ticket_id: u32;
    }, options?: AssembledTransactionOptions<TicketData>) => Promise<AssembledTransaction<TicketData>>;
    /**
     * Construct and simulate a list_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * List ticket on secondary marketplace
     */
    list_ticket: ({ seller, ticket_id, price }: {
        seller: string;
        ticket_id: u32;
        price: i128;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a mint_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Mint a ticket from primary marketplace (buy from event creator)
     */
    mint_ticket: ({ buyer }: {
        buyer: string;
    }, options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a delist_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Delist ticket from secondary marketplace
     */
    delist_ticket: ({ seller, ticket_id }: {
        seller: string;
        ticket_id: u32;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_event_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get event information
     */
    get_event_info: (options?: AssembledTransactionOptions<EventInfo>) => Promise<AssembledTransaction<EventInfo>>;
    /**
     * Construct and simulate a transfer_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Transfer ticket directly (P2P)
     */
    transfer_ticket: ({ from, to, ticket_id }: {
        from: string;
        to: string;
        ticket_id: u32;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_user_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get tickets owned by user
     */
    get_user_tickets: ({ user }: {
        user: string;
    }, options?: AssembledTransactionOptions<Array<u32>>) => Promise<AssembledTransaction<Array<u32>>>;
    /**
     * Construct and simulate a mark_ticket_used transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Mark ticket as used (check-in at event)
     */
    mark_ticket_used: ({ creator, ticket_id }: {
        creator: string;
        ticket_id: u32;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_tickets_minted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get number of tickets minted
     */
    get_tickets_minted: (options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a buy_secondary_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Buy ticket from secondary marketplace
     */
    buy_secondary_ticket: ({ buyer, ticket_id }: {
        buyer: string;
        ticket_id: u32;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a update_listing_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Update listing price
     */
    update_listing_price: ({ seller, ticket_id, new_price }: {
        seller: string;
        ticket_id: u32;
        new_price: i128;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_secondary_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get secondary listing
     */
    get_secondary_listing: ({ ticket_id }: {
        ticket_id: u32;
    }, options?: AssembledTransactionOptions<Option<SecondaryListing>>) => Promise<AssembledTransaction<Option<SecondaryListing>>>;
    /**
     * Construct and simulate a get_tickets_available transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get number of tickets available in primary market
     */
    get_tickets_available: (options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_all_secondary_listings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all secondary listings
     */
    get_all_secondary_listings: (options?: AssembledTransactionOptions<Array<SecondaryListing>>) => Promise<AssembledTransaction<Array<SecondaryListing>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        init: (json: string) => AssembledTransaction<null>;
        name: (json: string) => AssembledTransaction<string>;
        symbol: (json: string) => AssembledTransaction<string>;
        get_ticket: (json: string) => AssembledTransaction<TicketData>;
        list_ticket: (json: string) => AssembledTransaction<null>;
        mint_ticket: (json: string) => AssembledTransaction<number>;
        delist_ticket: (json: string) => AssembledTransaction<null>;
        get_event_info: (json: string) => AssembledTransaction<EventInfo>;
        transfer_ticket: (json: string) => AssembledTransaction<null>;
        get_user_tickets: (json: string) => AssembledTransaction<number[]>;
        mark_ticket_used: (json: string) => AssembledTransaction<null>;
        get_tickets_minted: (json: string) => AssembledTransaction<number>;
        buy_secondary_ticket: (json: string) => AssembledTransaction<null>;
        update_listing_price: (json: string) => AssembledTransaction<null>;
        get_secondary_listing: (json: string) => AssembledTransaction<Option<SecondaryListing>>;
        get_tickets_available: (json: string) => AssembledTransaction<number>;
        get_all_secondary_listings: (json: string) => AssembledTransaction<SecondaryListing[]>;
    };
}
