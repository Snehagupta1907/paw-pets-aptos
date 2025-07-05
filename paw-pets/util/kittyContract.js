"use client";

// Contract configuration
const CONTRACT_ADDRESS = "0x2afecf41b2f8834ce30f6c774eebcce52aea4fe932746c13e3f2c86b3b7dc975";
const MODULE_NAME = "kitty_game";
const FULL_MODULE_PATH = `${CONTRACT_ADDRESS}::${MODULE_NAME}`;

// Network configuration - using testnet for now, change to mainnet for production
const APTOS_NETWORK = "testnet"; // or "mainnet" for production
const APTOS_NODE_URL = APTOS_NETWORK === "mainnet" 
  ? "https://fullnode.mainnet.aptoslabs.com/v1"
  : "https://fullnode.testnet.aptoslabs.com/v1"; // Fixed testnet endpoint



// Initialize Aptos SDK - only on client side
let sdk = null;

const getSDK = async () => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return null
    return null;
  }
  
  if (!sdk) {
    try {
      const { Aptos, AptosConfig, Network } = await import("@aptos-labs/ts-sdk");
      console.log("Aptos SDK imported successfully");
      
      // Create config for testnet
      const config = new AptosConfig({ 
        network: APTOS_NETWORK === "mainnet" ? Network.MAINNET : Network.TESTNET 
      });
      
      // Initialize SDK
      sdk = new Aptos(config);
      console.log("Aptos SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Aptos SDK:", error);
      return null;
    }
  }
  
  return sdk;
};

// Request cache to prevent duplicate calls
const requestCache = new Map();
const pendingRequests = new Map();

/**
 * Helper function to check if wallet is connected
 */
export const isWalletConnected = () => {
  return typeof window !== 'undefined' && window.petra && window.petra.isConnected();
};

/**
 * Helper function to get current account address
 */
export const getCurrentAccount = async () => {
  if (!isWalletConnected()) {
    throw new Error("Wallet not connected");
  }
  
  try {
    const response = await window.petra.account();
    return response.address;
  } catch (error) {
    console.error("Failed to get account:", error);
    throw error;
  }
};

/**
 * Helper function to submit transaction
 */
const submitTransaction = async (payload) => {
  if (!isWalletConnected()) {
    throw new Error("Wallet not connected");
  }

  try {
    const response = await window.petra.signAndSubmitTransaction(payload);
    console.log("Transaction submitted:", response);
    
    // Wait for transaction to be confirmed
    const sdk = await getSDK();
    if (sdk) {
      await sdk.waitForTransaction({ transactionHash: response.hash });
    }
    return response;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};

/**
 * Initialize the kitty store (should be called once by contract owner)
 */
export const initializeKittyStore = async () => {
  const payload = {
    function: `${FULL_MODULE_PATH}::initialize`,
    type_arguments: [],
    arguments: []
  };

  return await submitTransaction(payload);
};

/**
 * Create a new kitty
 * @param {string} name - The name of the kitty
 */
export const createKitty = async (name) => {
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  
  const payload = {
    function: `${FULL_MODULE_PATH}::create_kitty`,
    type_arguments: [],
    arguments: [name, currentTime.toString()]
  };

  return await submitTransaction(payload);
};

/**
 * Feed a kitty
 * @param {number} kittyId - The ID of the kitty to feed
 */
export const feedKitty = async (kittyId) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    function: `${FULL_MODULE_PATH}::feed_kitty`,
    type_arguments: [],
    arguments: [kittyId.toString(), currentTime.toString()]
  };

  return await submitTransaction(payload);
};

/**
 * Play with a kitty
 * @param {number} kittyId - The ID of the kitty to play with
 */
export const playWithKitty = async (kittyId) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    function: `${FULL_MODULE_PATH}::play_with_kitty`,
    type_arguments: [],
    arguments: [kittyId.toString(), currentTime.toString()]
  };

  return await submitTransaction(payload);
};

/**
 * Put kitty to sleep
 * @param {number} kittyId - The ID of the kitty to put to sleep
 */
export const sleepKitty = async (kittyId) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    function: `${FULL_MODULE_PATH}::sleep_kitty`,
    type_arguments: [],
    arguments: [kittyId.toString(), currentTime.toString()]
  };

  return await submitTransaction(payload);
};

/**
 * Clean a kitty
 * @param {number} kittyId - The ID of the kitty to clean
 */
export const cleanKitty = async (kittyId) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    function: `${FULL_MODULE_PATH}::clean_kitty`,
    type_arguments: [],
    arguments: [kittyId.toString(), currentTime.toString()]
  };

  return await submitTransaction(payload);
};

/**
 * Add accessory to a kitty
 * @param {number} kittyId - The ID of the kitty
 * @param {string} accessory - The accessory to add
 */
export const addAccessory = async (kittyId, accessory) => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  const payload = {
    function: `${FULL_MODULE_PATH}::add_accessory`,
    type_arguments: [],
    arguments: [kittyId.toString(), accessory, currentTime.toString()]
  };

  return await submitTransaction(payload);
};

/**
 * Get kitty owner
 * @param {number} kittyId - The ID of the kitty
 */
export const getKittyOwner = async (kittyId) => {
  try {
    const client = await getClient();
    if (!client) {
      throw new Error("Client not available - running on server side");
    }
    
    const response = await client.view({
      function: `${FULL_MODULE_PATH}::get_kitty_owner`,
      type_arguments: [],
      arguments: [kittyId.toString()]
    });
    
    return response[0];
  } catch (error) {
    console.error("Failed to get kitty owner:", error);
    throw error;
  }
};

/**
 * Get all kitties for an owner with caching and debouncing
 * @param {string} ownerAddress - The owner's address
 */
export const getOwnerKitties = async (ownerAddress) => {
  try {
    // Check cache first
    const cacheKey = `owner_kitties_${ownerAddress}`;
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30 second cache
      console.log("Returning cached owner kitties");
      return cached.data;
    }
    
    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      console.log("Request already pending, waiting...");
      return await pendingRequests.get(cacheKey);
    }
    
    // Create new request promise
    const requestPromise = (async () => {
      try {
        console.log("Making new request for owner kitties:", ownerAddress);
        
        // Try SDK first
        const sdk = await getSDK();
        // if (sdk) {
        //   const payload = {
        //     function: `${FULL_MODULE_PATH}::get_owner_kitties`,
        //     typeArguments: [],
        //     functionArguments: [ownerAddress]
        //   };
        //   console.log("SDK payload:", payload);
        //   const response = await sdk.viewJson({ payload });
        //   console.log("SDK response:", response);
        //   return response[0] || [];
        // }
        
        // Fallback to REST API
        console.log("Using REST API fallback for getOwnerKitties");
        const requestBody = {
          function: `${FULL_MODULE_PATH}::get_owner_kitties`,
          type_arguments: [],
          arguments: [ownerAddress]
        };
        console.log("REST API request body:", requestBody);
        console.log("REST API URL:", `${APTOS_NODE_URL}/view`);
        
        // Try with retry logic for rate limiting
        let response;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            response = await fetch(`${APTOS_NODE_URL}/view`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });
            
            if (response.status === 429) {
              console.log(`Rate limited, attempt ${attempts + 1}/${maxAttempts}`);
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1))); // Exponential backoff
              attempts++;
              continue;
            }
            
            break; // Success or other error, break the loop
          } catch (error) {
            console.error(`Request attempt ${attempts + 1} failed:`, error);
            attempts++;
            if (attempts >= maxAttempts) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log("REST API raw response (first 500 chars):", responseText.substring(0, 500));
        
        if (!response.ok) {
          console.error("REST API error response:", responseText);
          throw new Error(`HTTP error! status: ${response.status}, body: ${responseText.substring(0, 200)}`);
        }
        
        // Check if response looks like HTML (error page)
        if (responseText.trim().startsWith('<') || responseText.includes('html')) {
          console.error("Received HTML instead of JSON:", responseText.substring(0, 500));
          throw new Error("Received HTML error page instead of JSON response");
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Response text that failed to parse:", responseText);
          throw new Error(`Failed to parse JSON response: ${parseError.message}`);
        }
        
        console.log("REST API parsed data:", data);
        const result = data[0] || [];
        
        // Cache the result
        requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();
    
    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return await requestPromise;
  } catch (error) {
    console.error("Failed to get owner kitties:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      ownerAddress
    });
    throw error;
  }
};

/**
 * Get kitty stats (hunger, energy, happiness, health, cleanliness)
 * @param {number} kittyId - The ID of the kitty
 */
export const getKittyStats = async (kittyId) => {
  try {
    // Try SDK first
    const sdk = await getSDK();
    if (sdk) {
      const payload = {
        function: `${FULL_MODULE_PATH}::get_kitty_stats`,
        typeArguments: [],
        functionArguments: [kittyId.toString()]
      };
      const response = await sdk.viewJson({ payload });
      
      return {
        hunger: response[0],
        energy: response[1],
        happiness: response[2],
        health: response[3],
        cleanliness: response[4]
      };
    }
    
    // Fallback to REST API
    console.log("Using REST API fallback for getKittyStats");
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: `${FULL_MODULE_PATH}::get_kitty_stats`,
        type_arguments: [],
        arguments: [kittyId.toString()]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      hunger: data[0],
      energy: data[1],
      happiness: data[2],
      health: data[3],
      cleanliness: data[4]
    };
  } catch (error) {
    console.error("Failed to get kitty stats:", error);
    throw error;
  }
};

/**
 * Get kitty stage as number (0: Baby, 1: Teen, 2: Adult, 3: Elder)
 * @param {number} kittyId - The ID of the kitty
 */
export const getKittyStage = async (kittyId) => {
  try {
    // Try SDK first
    const sdk = await getSDK();
    if (sdk) {
      const payload = {
        function: `${FULL_MODULE_PATH}::get_kitty_stage_u8`,
        typeArguments: [],
        functionArguments: [kittyId.toString()]
      };
      const response = await sdk.viewJson({ payload });
      return response[0];
    }
    
    // Fallback to REST API
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: `${FULL_MODULE_PATH}::get_kitty_stage_u8`,
        type_arguments: [],
        arguments: [kittyId.toString()]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Failed to get kitty stage:", error);
    throw error;
  }
};

/**
 * Get kitty mood as number (0: Happy, 1: Hungry, 2: Tired, 3: Sick, 4: Playful)
 * @param {number} kittyId - The ID of the kitty
 */
export const getKittyMood = async (kittyId) => {
  try {
    // Try SDK first
    const sdk = await getSDK();
    if (sdk) {
      const payload = {
        function: `${FULL_MODULE_PATH}::get_kitty_mood_u8`,
        typeArguments: [],
        functionArguments: [kittyId.toString()]
      };
      const response = await sdk.viewJson({ payload });
      return response[0];
    }
    
    // Fallback to REST API
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: `${FULL_MODULE_PATH}::get_kitty_mood_u8`,
        type_arguments: [],
        arguments: [kittyId.toString()]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Failed to get kitty mood:", error);
    throw error;
  }
};

/**
 * Get kitty name
 * @param {number} kittyId - The ID of the kitty
 */
export const getKittyName = async (kittyId) => {
  try {
    // Try SDK first
    const sdk = await getSDK();
    if (sdk) {
      const payload = {
        function: `${FULL_MODULE_PATH}::get_kitty_name`,
        typeArguments: [],
        functionArguments: [kittyId.toString()]
      };
      const response = await sdk.viewJson({ payload });
      return response[0];
    }
    
    // Fallback to REST API
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: `${FULL_MODULE_PATH}::get_kitty_name`,
        type_arguments: [],
        arguments: [kittyId.toString()]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Failed to get kitty name:", error);
    throw error;
  }
};

/**
 * Get current time from blockchain
 */
export const getCurrentTime = async () => {
  try {
    const sdk = await getSDK();
    if (sdk) {
      const payload = {
        function: `${FULL_MODULE_PATH}::get_time`,
        typeArguments: [],
        functionArguments: []
      };
      const response = await sdk.viewJson({ payload });
      return response[0];
    }
    
    // Fallback to REST API
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: `${FULL_MODULE_PATH}::get_time`,
        type_arguments: [],
        arguments: []
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Failed to get current time:", error);
    throw error;
  }
};

/**
 * Helper function to get stage name from stage number
 */
export const getStageName = (stageNumber) => {
  const stages = ["Baby", "Teen", "Adult", "Elder"];
  return stages[stageNumber] || "Unknown";
};

/**
 * Helper function to get mood name from mood number
 */
export const getMoodName = (moodNumber) => {
  const moods = ["Happy", "Hungry", "Tired", "Sick", "Playful"];
  return moods[moodNumber] || "Unknown";
};

/**
 * Get comprehensive kitty data including stats, stage, mood, and name
 * @param {number} kittyId - The ID of the kitty
 */
export const getKittyData = async (kittyId) => {
  try {
    const [stats, stage, mood, name] = await Promise.all([
      getKittyStats(kittyId),
      getKittyStage(kittyId),
      getKittyMood(kittyId),
      getKittyName(kittyId)
    ]);

    return {
      id: kittyId,
      name,
      stats,
      stage: {
        number: stage,
        name: getStageName(stage)
      },
      mood: {
        number: mood,
        name: getMoodName(mood)
      }
    };
  } catch (error) {
    console.error("Failed to get comprehensive kitty data:", error);
    throw error;
  }
};

/**
 * Get all kitties with their data for a specific owner
 * @param {string} ownerAddress - The owner's address
 */
export const getOwnerKittiesWithData = async (ownerAddress) => {
  try {
    const kittyIds = await getOwnerKitties(ownerAddress);
    const kittiesData = await Promise.all(
      kittyIds.map(kittyId => getKittyData(kittyId))
    );
    
    return kittiesData;
  } catch (error) {
    console.error("Failed to get owner kitties with data:", error);
    throw error;
  }
};

/**
 * Test function to check if contract is accessible
 */
export const testContractAccess = async () => {
  try {
    console.log("Testing contract access...");
    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("Module path:", FULL_MODULE_PATH);
    console.log("Network:", APTOS_NETWORK);
    console.log("Node URL:", APTOS_NODE_URL);
    
    // Try to get total kitties (should always work if contract exists)
    const sdk = await getSDK();
    if (sdk) {
      const payload = {
        function: `${FULL_MODULE_PATH}::get_total_kitties`,
        typeArguments: [],
        functionArguments: []
      };
      console.log("Testing with SDK payload:", payload);
      const response = await sdk.viewJson({ payload });
      console.log("SDK test response:", response);
      return { success: true, data: response };
    }
    
    // Fallback to REST API
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: `${FULL_MODULE_PATH}::get_total_kitties`,
        type_arguments: [],
        arguments: []
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Contract test failed:", errorText);
      return { success: false, error: errorText };
    }
    
    const data = await response.json();
    console.log("REST API test response:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Contract access test failed:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Test if contract is deployed and accessible
 */
export const testContractDeployment = async () => {
  try {
    console.log("Testing contract deployment...");
    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("Module path:", FULL_MODULE_PATH);
    console.log("Network:", APTOS_NETWORK);
    console.log("Node URL:", APTOS_NODE_URL);
    
    // First, check if the account exists
    const accountResponse = await fetch(`${APTOS_NODE_URL}/accounts/${CONTRACT_ADDRESS}`);
    console.log("Account check status:", accountResponse.status);
    
    if (!accountResponse.ok) {
      const accountError = await accountResponse.text();
      console.error("Account not found:", accountError);
      return { deployed: false, error: "Contract account not found" };
    }
    
    // Check if the module exists
    const moduleResponse = await fetch(`${APTOS_NODE_URL}/accounts/${CONTRACT_ADDRESS}/modules`);
    console.log("Module check status:", moduleResponse.status);
    
    if (!moduleResponse.ok) {
      const moduleError = await moduleResponse.text();
      console.error("Module check failed:", moduleError);
      return { deployed: false, error: "Module check failed" };
    }
    
    const modules = await moduleResponse.json();
    console.log("Available modules:", modules);
    
    const hasModule = modules.some(module => module.name === MODULE_NAME);
    if (!hasModule) {
      return { deployed: false, error: `Module ${MODULE_NAME} not found` };
    }
    
    return { deployed: true, modules };
  } catch (error) {
    console.error("Contract deployment test failed:", error);
    return { deployed: false, error: error.message };
  }
};

/**
 * Simple test to see what the API actually returns
 */
export const testApiResponse = async () => {
  try {
    console.log("=== API Response Test ===");
    console.log("Testing URL:", `${APTOS_NODE_URL}/view`);
    
    const testPayload = {
      function: `${FULL_MODULE_PATH}::get_total_kitties`,
      type_arguments: [],
      arguments: []
    };
    
    console.log("Test payload:", testPayload);
    
    const response = await fetch(`${APTOS_NODE_URL}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log("Full response text:", responseText);
    
    if (responseText.includes("Per anonym")) {
      console.error("Found 'Per anonym' in response - this is likely an HTML error page");
      console.log("Response starts with:", responseText.substring(0, 100));
    }
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      text: responseText,
      isHtml: responseText.includes('<html') || responseText.includes('Per anonym')
    };
  } catch (error) {
    console.error("API test failed:", error);
    return { error: error.message };
  }
};

// Export contract configuration for use in other files
export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS,
  moduleName: MODULE_NAME,
  fullPath: FULL_MODULE_PATH,
  network: APTOS_NETWORK
};

// Add accessory with payment
export async function addAccessoryWithPayment(
    kittyId, 
    accessoryName, 
    category // 0=Basic, 1=Medium, 2=Premium, 3=Legendary
) {
  console.log({kittyId, accessoryName, category})
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::add_accessory_with_payment`,
            type_arguments: [],
            arguments: [
                kittyId.toString(),
                accessoryName,
                category.toString(),
                Math.floor(Date.now() / 1000).toString()
            ]
        };

        const transaction = await submitTransaction(payload);
        
        return {
            success: true,
            hash: transaction.hash
        };
    } catch (error) {
        console.error('Error adding accessory with payment:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get accessory price by category
export async function getAccessoryPrice(category) {
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::get_accessory_price`,
            type_arguments: [],
            arguments: [category.toString()]
        };

        const response = await window.petra.view(payload);
        return response[0]; // Returns price in octas
    } catch (error) {
        console.error('Error getting accessory price:', error);
        return null;
    }
}

// Get all accessory prices
export async function getAllAccessoryPrices() {
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::get_all_accessory_prices`,
            type_arguments: [],
            arguments: []
        };

        const response = await window.petra.view(payload);
        return response[0]; // Returns array of prices in octas
    } catch (error) {
        console.error('Error getting all accessory prices:', error);
        return null;
    }
}

// Get treasury balance
export async function getTreasuryBalance() {
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::get_treasury_balance`,
            type_arguments: [],
            arguments: []
        };

        const response = await window.petra.view(payload);
        return response[0]; // Returns balance in octas
    } catch (error) {
        console.error('Error getting treasury balance:', error);
        return null;
    }
}

// Check if current user is deployer
export async function isDeployer(userAddress) {
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::is_deployer`,
            type_arguments: [],
            arguments: [userAddress]
        };

        const response = await window.petra.view(payload);
        return response[0]; // Returns boolean
    } catch (error) {
        console.error('Error checking deployer status:', error);
        return false;
    }
}

// Withdraw treasury funds (only deployer can call)
export async function withdrawTreasury(amount) {
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::withdraw_treasury`,
            type_arguments: [],
            arguments: [amount.toString()]
        };

        const transaction = await submitTransaction(payload);
        
        return {
            success: true,
            hash: transaction.hash
        };
    } catch (error) {
        console.error('Error withdrawing treasury:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Withdraw all treasury funds (only deployer can call)
export async function withdrawAllTreasury() {
    try {
        const payload = {
            function: `${FULL_MODULE_PATH}::withdraw_all_treasury`,
            type_arguments: [],
            arguments: []
        };

        const transaction = await submitTransaction(payload);
        
        return {
            success: true,
            hash: transaction.hash
        };
    } catch (error) {
        console.error('Error withdrawing all treasury:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Helper function to convert APT to octas
export function aptToOctas(aptAmount) {
    return Math.floor(aptAmount * 100000000);
}

// Helper function to convert octas to APT
export function octasToApt(octasAmount) {
    return octasAmount / 100000000;
}

// Accessory categories and their prices
export const ACCESSORY_CATEGORIES = {
    BASIC: {
        id: 0,
        name: 'Basic',
        price: 0.1, // APT
        examples: ['Collar', 'Tag', 'Bandana']
    },
    MEDIUM: {
        id: 1,
        name: 'Medium',
        price: 0.25, // APT
        examples: ['Hat', 'Scarf', 'Bow Tie']
    },
    PREMIUM: {
        id: 2,
        name: 'Premium',
        price: 0.5, // APT
        examples: ['Crown', 'Wings', 'Magic Wand']
    },
    LEGENDARY: {
        id: 3,
        name: 'Legendary',
        price: 1.0, // APT
        examples: ['Halo', 'Dragon Scale', 'Time Machine']
    }
};