#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, IntoVal, String,
     Val, Vec,
};


#[derive(Clone)]
#[contracttype]
pub struct EventRecord {
    pub event_contract: Address,
    pub event_creator: Address,
    pub name: String,
    pub symbol: String,
    pub created_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    WasmHash,
    EventCounter,
    EventRecord(u32),
    CreatorEvents(Address),
    AllEvents,
}

#[contract]
pub struct TicketFactory;

#[contractimpl]
impl TicketFactory {
    /// Initialize the factory with the ticket contract WASM hash
    pub fn initialize(env: Env, wasm_hash: BytesN<32>) {
        if env.storage().instance().has(&DataKey::WasmHash) {
            panic!("Factory already initialized");
        }

        env.storage().instance().set(&DataKey::WasmHash, &wasm_hash);
        env.storage().instance().set(&DataKey::EventCounter, &0u32);
        env.storage()
            .instance()
            .set(&DataKey::AllEvents, &Vec::<u32>::new(&env));
    }

    /// Deploy a new ticket marketplace event
    pub fn create_event(
        env: Env,
        salt: BytesN<32>,
        event_creator: Address,
        total_supply: u32,
        c: i128,
        creator_fee_bps: u32,
        event_metadata: String,
        name: String,
        symbol: String,
        payment_token: Address,
    ) -> Address {
        // Authenticate the creator
        event_creator.require_auth();

        // Retrieve the stored WASM hash for the NFT contract
        let wasm_hash: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::WasmHash)
            .expect("Factory not initialized");

        // Deploy the contract using the Factory's address + salt for deterministic addressing
        let deployed_address = env
            .deployer()
            .with_current_contract(salt)
            .deploy(wasm_hash);

        // Prepare arguments for the child contract's `init` function.
        // Important: invoke_contract requires a Vec<Val>, not a tuple.
        let mut init_args: Vec<Val> = Vec::new(&env);
        init_args.push_back(event_creator.clone().into_val(&env));
        init_args.push_back(total_supply.into_val(&env));
        init_args.push_back(primary_price.into_val(&env));
        init_args.push_back(creator_fee_bps.into_val(&env));
        init_args.push_back(event_metadata.into_val(&env));
        init_args.push_back(name.clone().into_val(&env));
        init_args.push_back(symbol.clone().into_val(&env));
        init_args.push_back(payment_token.into_val(&env));

        // Call the `initialize` function on the newly deployed contract
        env.invoke_contract::<()>(
            &deployed_address,
            &symbol_short!("init"), // Assuming the child function is named "init" or "initialize"
            init_args,
        );

        // --- Storage Logic Below ---

        // Get current counter
        let counter: u32 = env
            .storage()
            .instance()
            .get(&DataKey::EventCounter)
            .unwrap_or(0);
            
        let event_id = counter + 1;

        let event_record = EventRecord {
            event_contract: deployed_address.clone(),
            event_creator: event_creator.clone(),
            name: name.clone(),
            symbol: symbol.clone(),
            created_at: env.ledger().timestamp(),
        };

        // 1. Store the specific event record
        env.storage()
            .instance()
            .set(&DataKey::EventRecord(event_id), &event_record);

        // 2. Update global counter
        env.storage()
            .instance()
            .set(&DataKey::EventCounter, &event_id);

        // 3. Add to "All Events" list
        let mut all_events: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::AllEvents)
            .unwrap_or(Vec::new(&env));
            
        all_events.push_back(event_id);
        
        env.storage()
            .instance()
            .set(&DataKey::AllEvents, &all_events);

        // 4. Add to "Creator Events" list
        let mut creator_events: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::CreatorEvents(event_creator.clone()))
            .unwrap_or(Vec::new(&env));
            
        creator_events.push_back(event_id);
        
        env.storage()
            .instance()
            .set(&DataKey::CreatorEvents(event_creator), &creator_events);

        deployed_address
    }

    /// Get event record by ID
    pub fn get_event(env: Env, event_id: u32) -> EventRecord {
        env.storage()
            .instance()
            .get(&DataKey::EventRecord(event_id))
            .expect("Event not found")
    }

    /// Get all events created by a specific address
    pub fn get_creator_events(env: Env, creator: Address) -> Vec<EventRecord> {
        let event_ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::CreatorEvents(creator))
            .unwrap_or(Vec::new(&env));

        let mut events = Vec::new(&env);
        for i in 0..event_ids.len() {
            if let Some(event_id) = event_ids.get(i) {
                if let Some(record) = env
                    .storage()
                    .instance()
                    .get::<DataKey, EventRecord>(&DataKey::EventRecord(event_id))
                {
                    events.push_back(record);
                }
            }
        }
        events
    }

    /// Get all events
    pub fn get_all_events(env: Env) -> Vec<EventRecord> {
        let event_ids: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::AllEvents)
            .unwrap_or(Vec::new(&env));

        let mut events = Vec::new(&env);
        for i in 0..event_ids.len() {
            if let Some(event_id) = event_ids.get(i) {
                if let Some(record) = env
                    .storage()
                    .instance()
                    .get::<DataKey, EventRecord>(&DataKey::EventRecord(event_id))
                {
                    events.push_back(record);
                }
            }
        }
        events
    }

    /// Get total number of events created
    pub fn get_event_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::EventCounter)
            .unwrap_or(0)
    }

    /// Get the WASM hash stored in the factory
    pub fn get_wasm_hash(env: Env) -> BytesN<32> {
        env.storage()
            .instance()
            .get(&DataKey::WasmHash)
            .expect("Factory not initialized")
    }
}
