import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, i128, AssembledTransactionOptions } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CA2HZDTERE5QPWW3G3YZWB2XTNPGCW2HTEJEWDKCCAHZ7Q4NEO5FWL4V";
    };
};
export type DataKey = {
    tag: "WasmHash";
    values: void;
} | {
    tag: "EventCounter";
    values: void;
} | {
    tag: "EventRecord";
    values: readonly [u32];
} | {
    tag: "CreatorEvents";
    values: readonly [string];
} | {
    tag: "AllEvents";
    values: void;
};
export interface EventRecord {
    created_at: u64;
    event_contract: string;
    event_creator: string;
    name: string;
    symbol: string;
}
export interface Client {
    /**
     * Construct and simulate a get_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get event record by ID
     */
    get_event: ({ event_id }: {
        event_id: u32;
    }, options?: AssembledTransactionOptions<EventRecord>) => Promise<AssembledTransaction<EventRecord>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the factory with the ticket contract WASM hash
     */
    initialize: ({ wasm_hash }: {
        wasm_hash: Buffer;
    }, options?: AssembledTransactionOptions<null>) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a create_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Deploy a new ticket marketplace event
     */
    create_event: ({ salt, event_creator, total_supply, primary_price, creator_fee_bps, event_metadata, name, symbol, payment_token }: {
        salt: Buffer;
        event_creator: string;
        total_supply: u32;
        primary_price: i128;
        creator_fee_bps: u32;
        event_metadata: string;
        name: string;
        symbol: string;
        payment_token: string;
    }, options?: AssembledTransactionOptions<string>) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_wasm_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get the WASM hash stored in the factory
     */
    get_wasm_hash: (options?: AssembledTransactionOptions<Buffer>) => Promise<AssembledTransaction<Buffer>>;
    /**
     * Construct and simulate a get_all_events transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all events
     */
    get_all_events: (options?: AssembledTransactionOptions<Array<EventRecord>>) => Promise<AssembledTransaction<Array<EventRecord>>>;
    /**
     * Construct and simulate a get_event_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get total number of events created
     */
    get_event_count: (options?: AssembledTransactionOptions<u32>) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_creator_events transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Get all events created by a specific address
     */
    get_creator_events: ({ creator }: {
        creator: string;
    }, options?: AssembledTransactionOptions<Array<EventRecord>>) => Promise<AssembledTransaction<Array<EventRecord>>>;
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
        get_event: (json: string) => AssembledTransaction<EventRecord>;
        initialize: (json: string) => AssembledTransaction<null>;
        create_event: (json: string) => AssembledTransaction<string>;
        get_wasm_hash: (json: string) => AssembledTransaction<Buffer>;
        get_all_events: (json: string) => AssembledTransaction<EventRecord[]>;
        get_event_count: (json: string) => AssembledTransaction<number>;
        get_creator_events: (json: string) => AssembledTransaction<EventRecord[]>;
    };
}
