# Move 2.0 Full Stack Development Guide

## Overview

Move 2.0 is the latest version of the Move programming language, designed specifically for blockchain development on the Aptos network. This guide covers building complete full stack applications using Move 2.0.

## Table of Contents

1. [Move 2.0 Fundamentals](#move-20-fundamentals)
2. [Setting Up Development Environment](#setting-up-development-environment)
3. [Smart Contract Development](#smart-contract-development)
4. [Frontend Development](#frontend-development)
5. [Backend Integration](#backend-integration)
6. [Testing and Deployment](#testing-and-deployment)
7. [Full Stack Architecture](#full-stack-architecture)

## Move 2.0 Fundamentals

### What is Move 2.0?

Move 2.0 is an evolution of the Move programming language that introduces:
- Enhanced type system
- Improved resource management
- Better error handling
- More flexible module system
- Enhanced security features

### Key Features

1. **Resource-Oriented Programming**: Move treats all data as resources that can be moved but not copied
2. **Linear Types**: Ensures resources are used exactly once
3. **Module System**: Encapsulated code units with controlled access
4. **Formal Verification**: Built-in support for mathematical proofs of correctness

### Basic Syntax

```move
module my_module {
    use std::signer;
    use aptos_framework::account;
    
    struct MyResource has key {
        value: u64,
    }
    
    public entry fun initialize(account: &signer) {
        let resource = MyResource { value: 0 };
        move_to(account, resource);
    }
    
    public entry fun update_value(account: &signer, new_value: u64) {
        let resource = borrow_global_mut<MyResource>(signer::address_of(account));
        resource.value = new_value;
    }
}
```

## Setting Up Development Environment

### Prerequisites

- Rust (latest stable version)
- Node.js (v18 or later)
- Git

### Installation Steps

1. **Install Aptos CLI**
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

2. **Install Move Analyzer**
```bash
cargo install --git https://github.com/move-language/move move-analyzer --branch main
```

3. **Install Aptos SDK**
```bash
npm install aptos
```

### Project Structure

```
aptos-pet/
├── move/
│   ├── sources/
│   ├── tests/
│   └── Move.toml
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   └── package.json
└── docs/
```

## Smart Contract Development

### Creating Your First Move Module

1. **Initialize Move Project**
```bash
aptos init --template move_module
```

2. **Basic Module Structure**
```move
module pet_store {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    
    struct Pet has key, store {
        id: u64,
        name: String,
        owner: address,
        created_at: u64,
    }
    
    struct PetStore has key {
        pets: vector<u64>,
        next_id: u64,
    }
    
    public entry fun initialize(account: &signer) {
        let store = PetStore {
            pets: vector::empty(),
            next_id: 0,
        };
        move_to(account, store);
    }
    
    public entry fun create_pet(
        account: &signer,
        name: String,
    ) {
        let store = borrow_global_mut<PetStore>(signer::address_of(account));
        let pet_id = store.next_id;
        store.next_id = store.next_id + 1;
        
        let pet = Pet {
            id: pet_id,
            name,
            owner: signer::address_of(account),
            created_at: timestamp::now_seconds(),
        };
        
        move_to(account, pet);
        vector::push_back(&mut store.pets, pet_id);
    }
}
```

### Advanced Features

1. **Resource Management**
```move
public entry fun transfer_pet(
    from: &signer,
    to: address,
    pet_id: u64,
) {
    let pet = move_from<Pet>(signer::address_of(from));
    pet.owner = to;
    move_to(&account::create_signer_with_capability(
        &account::create_test_signer_cap(to)
    ), pet);
}
```

2. **Events**
```move
struct PetCreatedEvent has drop, store {
    pet_id: u64,
    name: String,
    owner: address,
}

public entry fun create_pet_with_event(
    account: &signer,
    name: String,
) {
    // ... pet creation logic ...
    
    event::emit(PetCreatedEvent {
        pet_id,
        name,
        owner: signer::address_of(account),
    });
}
```

## Frontend Development

### React Integration

1. **Setup React App**
```bash
npx create-react-app frontend --template typescript
cd frontend
npm install aptos
```

2. **Wallet Connection**
```typescript
import { AptosClient, AptosAccount, TxnBuilderTypes } from "aptos";

class AptosService {
    private client: AptosClient;
    private account: AptosAccount | null = null;

    constructor() {
        this.client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");
    }

    async connectWallet(): Promise<void> {
        if ("aptos" in window) {
            try {
                await window.aptos.connect();
                const account = await window.aptos.account();
                this.account = new AptosAccount(account.publicKey);
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        }
    }

    async createPet(name: string): Promise<void> {
        if (!this.account) throw new Error("Wallet not connected");

        const payload = {
            function: `${this.account.address()}::pet_store::create_pet`,
            type_arguments: [],
            arguments: [name],
        };

        const transaction = await window.aptos.signAndSubmitTransaction(payload);
        await this.client.waitForTransaction(transaction.hash);
    }
}
```

3. **UI Components**
```typescript
import React, { useState, useEffect } from 'react';
import { AptosService } from './services/AptosService';

const PetStore: React.FC = () => {
    const [aptosService] = useState(new AptosService());
    const [pets, setPets] = useState([]);
    const [petName, setPetName] = useState('');

    const handleCreatePet = async () => {
        try {
            await aptosService.createPet(petName);
            setPetName('');
            // Refresh pets list
        } catch (error) {
            console.error('Failed to create pet:', error);
        }
    };

    return (
        <div className="pet-store">
            <h1>Pet Store</h1>
            <div className="create-pet">
                <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter pet name"
                />
                <button onClick={handleCreatePet}>Create Pet</button>
            </div>
            <div className="pets-list">
                {pets.map(pet => (
                    <div key={pet.id} className="pet-card">
                        <h3>{pet.name}</h3>
                        <p>ID: {pet.id}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

## Backend Integration

### Node.js Backend

1. **Express Server Setup**
```typescript
import express from 'express';
import { AptosClient } from 'aptos';
import cors from 'cors';

const app = express();
const aptosClient = new AptosClient("https://fullnode.mainnet.aptoslabs.com");

app.use(cors());
app.use(express.json());

// Get pet by ID
app.get('/api/pets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await aptosClient.getAccountResource(
            accountAddress,
            `${accountAddress}::pet_store::Pet`
        );
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pet' });
    }
});

// Get all pets for an account
app.get('/api/pets/account/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const resources = await aptosClient.getAccountResources(address);
        const pets = resources.filter(resource => 
            resource.type.includes('::pet_store::Pet')
        );
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pets' });
    }
});

app.listen(3001, () => {
    console.log('Backend server running on port 3001');
});
```

## Testing and Deployment

### Move Testing

```move
#[test_only]
module pet_store_tests {
    use std::signer;
    use pet_store;
    
    #[test]
    fun test_create_pet() {
        let account = account::create_account_for_test(@0x1);
        pet_store::initialize(&account);
        
        let pet_name = string::utf8(b"Fluffy");
        pet_store::create_pet(&account, pet_name);
        
        // Verify pet was created
        let pet = borrow_global<pet_store::Pet>(@0x1);
        assert!(pet.name == pet_name, 0);
    }
}
```

### Frontend Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import PetStore from './PetStore';

test('creates a pet when form is submitted', async () => {
    render(<PetStore />);
    
    const input = screen.getByPlaceholderText('Enter pet name');
    const button = screen.getByText('Create Pet');
    
    fireEvent.change(input, { target: { value: 'Fluffy' } });
    fireEvent.click(button);
    
    // Add assertions for expected behavior
});
```

### Deployment

1. **Deploy to Testnet**
```bash
aptos move compile
aptos move test
aptos move publish --named-addresses pet_store=<account_address>
```

2. **Deploy to Mainnet**
```bash
aptos move publish --named-addresses pet_store=<account_address> --profile mainnet
```

## Full Stack Architecture

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Aptos         │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Blockchain    │
│                 │    │                 │    │                 │
│ - Wallet Connect│    │ - API Gateway   │    │ - Move Modules  │
│ - UI Components │    │ - Event Indexer │    │ - Smart         │
│ - State Mgmt    │    │ - Cache Layer   │    │   Contracts     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Best Practices

1. **Security**
   - Always validate inputs on both frontend and backend
   - Use proper access controls in Move modules
   - Implement proper error handling

2. **Performance**
   - Use indexing for frequently accessed data
   - Implement caching strategies
   - Optimize Move module gas usage

3. **User Experience**
   - Provide clear error messages
   - Implement loading states
   - Add transaction confirmation flows

## Resources

- [Aptos Documentation](https://aptos.dev/)
- [Move Language Book](https://move-language.github.io/move/)
- [Aptos SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Move Examples](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/framework/move-stdlib/sources)

## Next Steps

1. Set up your development environment
2. Create your first Move module
3. Build a simple frontend
4. Add backend integration
5. Deploy to testnet
6. Add advanced features

This guide provides a foundation for building full stack applications with Move 2.0 and Aptos. Start with the basics and gradually add more complex features as you become comfortable with the ecosystem. 