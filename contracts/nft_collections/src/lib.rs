#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub struct TicketData {
    pub owner: Address,
    pub ticket_id: u32,
    pub is_used: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct EventInfo {
    pub event_creator: Address,
    pub total_supply: u32,
    pub primary_price: i128,
    pub creator_fee_bps: u32,
    pub event_metadata: String,
    pub payment_token: Address,
    pub name: String,
    pub symbol: String,
}

#[derive(Clone)]
#[contracttype]
pub struct SecondaryListing {
    pub ticket_id: u32,
    pub seller: Address,
    pub price: i128,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    EventInfo,
    Ticket(u32),
    TicketsMinted,
    SecondaryListing(u32),
    UserTickets(Address),
}

#[contract]
pub struct TicketMarketplace;

#[contractimpl]
impl TicketMarketplace {
    /// Initialize the ticket marketplace contract
    pub fn init(
        env: Env,
        event_creator: Address,
        total_supply: u32,
        primary_price: i128,
        creator_fee_bps: u32,
        event_metadata: String,
        name: String,
        symbol: String,
        payment_token: Address,
    ) {
        // Ensure not already initialized
        if env.storage().instance().has(&DataKey::EventInfo) {
            panic!("Contract already initialized");
        }

        // Validate inputs
        if total_supply == 0 {
            panic!("Total supply must be greater than 0");
        }
        if primary_price <= 0 {
            panic!("Primary price must be positive");
        }
        if creator_fee_bps > 10000 {
            panic!("Fee basis points cannot exceed 10000 (100%)");
        }

        let event_info = EventInfo {
            event_creator,
            total_supply,
            primary_price,
            creator_fee_bps,
            event_metadata,
            payment_token,
            // --- NEW ASSIGNMENTS ---
            name,
            symbol,
        };

        env.storage()
            .instance()
            .set(&DataKey::EventInfo, &event_info);
        env.storage().instance().set(&DataKey::TicketsMinted, &0u32);
    }

    /// Mint a ticket from primary marketplace (buy from event creator)
    pub fn mint_ticket(env: Env, buyer: Address) -> u32 {
        buyer.require_auth();

        let event_info: EventInfo = env
            .storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized");

        let tickets_minted: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TicketsMinted)
            .unwrap_or(0);

        // Check if sold out
        if tickets_minted >= event_info.total_supply {
            panic!("All tickets sold out");
        }

        // Transfer payment from buyer to event creator
        let token_client = token::Client::new(&env, &event_info.payment_token);
        token_client.transfer(&buyer, &event_info.event_creator, &event_info.primary_price);

        // Create new ticket
        let ticket_id = tickets_minted + 1;
        let ticket = TicketData {
            owner: buyer.clone(),
            ticket_id,
            is_used: false,
        };

        // Store ticket
        env.storage()
            .instance()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        env.storage()
            .instance()
            .set(&DataKey::TicketsMinted, &ticket_id);

        // Add to user's ticket list
        Self::add_ticket_to_user(&env, &buyer, ticket_id);

        ticket_id
    }

    /// List ticket on secondary marketplace
    pub fn list_ticket(env: Env, seller: Address, ticket_id: u32, price: i128) {
        seller.require_auth();

        if price <= 0 {
            panic!("Price must be positive");
        }

        // Get ticket and verify ownership
        let ticket: TicketData = env
            .storage()
            .instance()
            .get(&DataKey::Ticket(ticket_id))
            .expect("Ticket does not exist");

        if ticket.owner != seller {
            panic!("Only ticket owner can list");
        }

        if ticket.is_used {
            panic!("Cannot list used ticket");
        }

        // Check if already listed
        if env
            .storage()
            .instance()
            .has(&DataKey::SecondaryListing(ticket_id))
        {
            panic!("Ticket already listed");
        }

        let listing = SecondaryListing {
            ticket_id,
            seller,
            price,
        };

        env.storage()
            .instance()
            .set(&DataKey::SecondaryListing(ticket_id), &listing);
    }

    /// Buy ticket from secondary marketplace
    pub fn buy_secondary_ticket(env: Env, buyer: Address, ticket_id: u32) {
        buyer.require_auth();

        let listing: SecondaryListing = env
            .storage()
            .instance()
            .get(&DataKey::SecondaryListing(ticket_id))
            .expect("Ticket not listed for sale");

        let mut ticket: TicketData = env
            .storage()
            .instance()
            .get(&DataKey::Ticket(ticket_id))
            .expect("Ticket does not exist");

        if ticket.is_used {
            panic!("Cannot buy used ticket");
        }

        let event_info: EventInfo = env
            .storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized");

        // Calculate creator fee
        let creator_fee = (listing.price * event_info.creator_fee_bps as i128) / 10000;
        let seller_amount = listing.price - creator_fee;

        let token_client = token::Client::new(&env, &event_info.payment_token);

        // Transfer creator fee
        if creator_fee > 0 {
            token_client.transfer(&buyer, &event_info.event_creator, &creator_fee);
        }

        // Transfer payment to seller
        token_client.transfer(&buyer, &listing.seller, &seller_amount);

        // Update ticket ownership
        Self::remove_ticket_from_user(&env, &ticket.owner, ticket_id);
        ticket.owner = buyer.clone();
        env.storage()
            .instance()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        Self::add_ticket_to_user(&env, &buyer, ticket_id);

        // Remove listing
        env.storage()
            .instance()
            .remove(&DataKey::SecondaryListing(ticket_id));
    }

    /// Delist ticket from secondary marketplace
    pub fn delist_ticket(env: Env, seller: Address, ticket_id: u32) {
        seller.require_auth();

        let listing: SecondaryListing = env
            .storage()
            .instance()
            .get(&DataKey::SecondaryListing(ticket_id))
            .expect("Ticket not listed");

        if listing.seller != seller {
            panic!("Only the seller can delist");
        }

        env.storage()
            .instance()
            .remove(&DataKey::SecondaryListing(ticket_id));
    }

    /// Update listing price
    pub fn update_listing_price(env: Env, seller: Address, ticket_id: u32, new_price: i128) {
        seller.require_auth();

        if new_price <= 0 {
            panic!("Price must be positive");
        }

        let mut listing: SecondaryListing = env
            .storage()
            .instance()
            .get(&DataKey::SecondaryListing(ticket_id))
            .expect("Ticket not listed");

        if listing.seller != seller {
            panic!("Only the seller can update price");
        }

        listing.price = new_price;
        env.storage()
            .instance()
            .set(&DataKey::SecondaryListing(ticket_id), &listing);
    }

    /// Transfer ticket directly (P2P)
    pub fn transfer_ticket(env: Env, from: Address, to: Address, ticket_id: u32) {
        from.require_auth();

        let mut ticket: TicketData = env
            .storage()
            .instance()
            .get(&DataKey::Ticket(ticket_id))
            .expect("Ticket does not exist");

        if ticket.owner != from {
            panic!("Only ticket owner can transfer");
        }

        if ticket.is_used {
            panic!("Cannot transfer used ticket");
        }

        // Check if listed in secondary market
        if env
            .storage()
            .instance()
            .has(&DataKey::SecondaryListing(ticket_id))
        {
            panic!("Cannot transfer listed ticket. Delist first.");
        }

        // Update ownership
        Self::remove_ticket_from_user(&env, &from, ticket_id);
        ticket.owner = to.clone();
        env.storage()
            .instance()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        Self::add_ticket_to_user(&env, &to, ticket_id);
    }

    /// Mark ticket as used (check-in at event)
    pub fn mark_ticket_used(env: Env, creator: Address, ticket_id: u32) {
        creator.require_auth();

        let event_info: EventInfo = env
            .storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized");

        if creator != event_info.event_creator {
            panic!("Only event creator can mark tickets as used");
        }

        let mut ticket: TicketData = env
            .storage()
            .instance()
            .get(&DataKey::Ticket(ticket_id))
            .expect("Ticket does not exist");

        if ticket.is_used {
            panic!("Ticket already used");
        }

        ticket.is_used = true;
        env.storage()
            .instance()
            .set(&DataKey::Ticket(ticket_id), &ticket);

        // Remove from secondary market if listed
        if env
            .storage()
            .instance()
            .has(&DataKey::SecondaryListing(ticket_id))
        {
            env.storage()
                .instance()
                .remove(&DataKey::SecondaryListing(ticket_id));
        }
    }

    // === Query Functions ===

    // --- NEW: Name and Symbol Getters ---

    /// Get the name of the event/ticket collection
    pub fn name(env: Env) -> String {
        let event_info: EventInfo = env
            .storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized");
        event_info.name
    }

    /// Get the symbol of the ticket
    pub fn symbol(env: Env) -> String {
        let event_info: EventInfo = env
            .storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized");
        event_info.symbol
    }

    // ------------------------------------

    /// Get ticket information
    pub fn get_ticket(env: Env, ticket_id: u32) -> TicketData {
        env.storage()
            .instance()
            .get(&DataKey::Ticket(ticket_id))
            .expect("Ticket does not exist")
    }

    /// Get event information
    pub fn get_event_info(env: Env) -> EventInfo {
        env.storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized")
    }

    /// Get tickets owned by user
    pub fn get_user_tickets(env: Env, user: Address) -> Vec<u32> {
        env.storage()
            .instance()
            .get(&DataKey::UserTickets(user))
            .unwrap_or(Vec::new(&env))
    }

    /// Get secondary listing
    pub fn get_secondary_listing(env: Env, ticket_id: u32) -> Option<SecondaryListing> {
        env.storage()
            .instance()
            .get(&DataKey::SecondaryListing(ticket_id))
    }

    /// Get all secondary listings
    pub fn get_all_secondary_listings(env: Env) -> Vec<SecondaryListing> {
        let tickets_minted: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TicketsMinted)
            .unwrap_or(0);

        let mut listings = Vec::new(&env);
        for i in 1..=tickets_minted {
            if let Some(listing) = env
                .storage()
                .instance()
                .get::<DataKey, SecondaryListing>(&DataKey::SecondaryListing(i))
            {
                listings.push_back(listing);
            }
        }
        listings
    }

    /// Get number of tickets minted
    pub fn get_tickets_minted(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TicketsMinted)
            .unwrap_or(0)
    }

    /// Get number of tickets available in primary market
    pub fn get_tickets_available(env: Env) -> u32 {
        let event_info: EventInfo = env
            .storage()
            .instance()
            .get(&DataKey::EventInfo)
            .expect("Contract not initialized");

        let minted: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TicketsMinted)
            .unwrap_or(0);

        event_info.total_supply - minted
    }

    // === Helper Functions ===

    fn add_ticket_to_user(env: &Env, user: &Address, ticket_id: u32) {
        let mut user_tickets: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::UserTickets(user.clone()))
            .unwrap_or(Vec::new(env));

        user_tickets.push_back(ticket_id);
        env.storage()
            .instance()
            .set(&DataKey::UserTickets(user.clone()), &user_tickets);
    }

    fn remove_ticket_from_user(env: &Env, user: &Address, ticket_id: u32) {
        let mut user_tickets: Vec<u32> = env
            .storage()
            .instance()
            .get(&DataKey::UserTickets(user.clone()))
            .unwrap_or(Vec::new(env));

        // Find and remove ticket_id
        let mut new_tickets = Vec::new(env);
        for i in 0..user_tickets.len() {
            let tid = user_tickets.get(i).unwrap();
            if tid != ticket_id {
                new_tickets.push_back(tid);
            }
        }

        env.storage()
            .instance()
            .set(&DataKey::UserTickets(user.clone()), &new_tickets);
    }
}

mod test;
