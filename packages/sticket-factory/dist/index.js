import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CA2HZDTERE5QPWW3G3YZWB2XTNPGCW2HTEJEWDKCCAHZ7Q4NEO5FWL4V",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAACFdhc21IYXNoAAAAAAAAAAAAAAAMRXZlbnRDb3VudGVyAAAAAQAAAAAAAAALRXZlbnRSZWNvcmQAAAAAAQAAAAQAAAABAAAAAAAAAA1DcmVhdG9yRXZlbnRzAAAAAAAAAQAAABMAAAAAAAAAAAAAAAlBbGxFdmVudHMAAAA=",
            "AAAAAQAAAAAAAAAAAAAAC0V2ZW50UmVjb3JkAAAAAAUAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAADmV2ZW50X2NvbnRyYWN0AAAAAAATAAAAAAAAAA1ldmVudF9jcmVhdG9yAAAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAABnN5bWJvbAAAAAAAEA==",
            "AAAAAAAAABZHZXQgZXZlbnQgcmVjb3JkIGJ5IElEAAAAAAAJZ2V0X2V2ZW50AAAAAAAAAQAAAAAAAAAIZXZlbnRfaWQAAAAEAAAAAQAAB9AAAAALRXZlbnRSZWNvcmQA",
            "AAAAAAAAADlJbml0aWFsaXplIHRoZSBmYWN0b3J5IHdpdGggdGhlIHRpY2tldCBjb250cmFjdCBXQVNNIGhhc2gAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
            "AAAAAAAAACVEZXBsb3kgYSBuZXcgdGlja2V0IG1hcmtldHBsYWNlIGV2ZW50AAAAAAAADGNyZWF0ZV9ldmVudAAAAAkAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAANZXZlbnRfY3JlYXRvcgAAAAAAABMAAAAAAAAADHRvdGFsX3N1cHBseQAAAAQAAAAAAAAADXByaW1hcnlfcHJpY2UAAAAAAAALAAAAAAAAAA9jcmVhdG9yX2ZlZV9icHMAAAAABAAAAAAAAAAOZXZlbnRfbWV0YWRhdGEAAAAAABAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAZzeW1ib2wAAAAAABAAAAAAAAAADXBheW1lbnRfdG9rZW4AAAAAAAATAAAAAQAAABM=",
            "AAAAAAAAACdHZXQgdGhlIFdBU00gaGFzaCBzdG9yZWQgaW4gdGhlIGZhY3RvcnkAAAAADWdldF93YXNtX2hhc2gAAAAAAAAAAAAAAQAAA+4AAAAg",
            "AAAAAAAAAA5HZXQgYWxsIGV2ZW50cwAAAAAADmdldF9hbGxfZXZlbnRzAAAAAAAAAAAAAQAAA+oAAAfQAAAAC0V2ZW50UmVjb3JkAA==",
            "AAAAAAAAACJHZXQgdG90YWwgbnVtYmVyIG9mIGV2ZW50cyBjcmVhdGVkAAAAAAAPZ2V0X2V2ZW50X2NvdW50AAAAAAAAAAABAAAABA==",
            "AAAAAAAAACxHZXQgYWxsIGV2ZW50cyBjcmVhdGVkIGJ5IGEgc3BlY2lmaWMgYWRkcmVzcwAAABJnZXRfY3JlYXRvcl9ldmVudHMAAAAAAAEAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAEAAAPqAAAH0AAAAAtFdmVudFJlY29yZAA="]), options);
        this.options = options;
    }
    fromJSON = {
        get_event: (this.txFromJSON),
        initialize: (this.txFromJSON),
        create_event: (this.txFromJSON),
        get_wasm_hash: (this.txFromJSON),
        get_all_events: (this.txFromJSON),
        get_event_count: (this.txFromJSON),
        get_creator_events: (this.txFromJSON)
    };
}
