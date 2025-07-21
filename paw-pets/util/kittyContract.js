"use client";

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './web3Config';
import { parseEther, formatEther } from 'viem';

// Contract configuration
export const CONTRACT_ADDRESS_STR = CONTRACT_ADDRESS;
export const CONTRACT_ABI_STR = CONTRACT_ABI;

// Request cache to prevent duplicate calls
const requestCache = new Map();
const pendingRequests = new Map();

/**
 * Helper function to check if wallet is connected
 */
export const isWalletConnected = () => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isConnected();
};

/**
 * Get current account address
 */
export const getCurrentAccount = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not connected');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    throw new Error('Failed to get account');
  }
};

/**
 * Create a new kitty
 */
export const useCreateKitty = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const createKitty = async (name) => {
    if (!name || name.trim() === '') {
      throw new Error('Kitty name cannot be empty');
    }
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createKitty',
        args: [name]
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error creating kitty:', error);
      throw new Error(`Failed to create kitty: ${error.message}`);
    }
  };

  return { createKitty, isPending, hash };
};

/**
 * Feed a kitty
 */
export const useFeedKitty = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const feedKitty = async (kittyId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'feedKitty',
        args: [kittyId]
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error feeding kitty:', error);
      throw new Error(`Failed to feed kitty: ${error.message}`);
    }
  };

  return { feedKitty, isPending, hash };
};

/**
 * Play with a kitty
 */
export const usePlayWithKitty = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const playWithKitty = async (kittyId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'playWithKitty',
        args: [kittyId]
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error playing with kitty:', error);
      throw new Error(`Failed to play with kitty: ${error.message}`);
    }
  };

  return { playWithKitty, isPending, hash };
};

/**
 * Put kitty to sleep
 */
export const useSleepKitty = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const sleepKitty = async (kittyId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'sleepKitty',
        args: [kittyId]
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error putting kitty to sleep:', error);
      throw new Error(`Failed to put kitty to sleep: ${error.message}`);
    }
  };

  return { sleepKitty, isPending, hash };
};

/**
 * Clean a kitty
 */
export const useCleanKitty = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const cleanKitty = async (kittyId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cleanKitty',
        args: [kittyId]
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error cleaning kitty:', error);
      throw new Error(`Failed to clean kitty: ${error.message}`);
    }
  };

  return { cleanKitty, isPending, hash };
};

/**
 * Add accessory with payment
 */
export const useAddAccessoryWithPayment = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const addAccessoryWithPayment = async (kittyId, accessory, category, value) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addAccessoryWithPayment',
        args: [kittyId, accessory, category],
        value: parseEther(value)
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error adding accessory:', error);
      throw new Error(`Failed to add accessory: ${error.message}`);
    }
  };

  return { addAccessoryWithPayment, isPending, hash };
};

/**
 * Add accessory for free (testing)
 */
export const useAddAccessory = () => {
  const { writeContract, isPending, data: hash } = useWriteContract();
  
  const addAccessory = async (kittyId, accessory) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addAccessory',
        args: [kittyId, accessory]
      });
      return { success: true, hash };
    } catch (error) {
      console.error('Error adding accessory:', error);
      throw new Error(`Failed to add accessory: ${error.message}`);
    }
  };

  return { addAccessory, isPending, hash };
};

/**
 * Get kitty owner
 */
export const useGetKittyOwner = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyOwner',
    args: [kittyId],
  });
  
  return { data, isError, isLoading };
};

/**
 * Get owner kitties
 */
export const useGetOwnerKitties = (owner) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOwnerKitties',
    args: [owner],
  });
  
  return { data: data || [], isError, isLoading };
};

/**
 * Get kitty stats
 */
export const useGetKittyStats = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyStats',
    args: [kittyId],
  });
  
  if (data) {
    const [hunger, energy, happiness, health, cleanliness] = data;
    return { 
      data: { hunger, energy, happiness, health, cleanliness }, 
      isError, 
      isLoading 
    };
  }
  
  return { data: null, isError, isLoading };
};

/**
 * Get kitty progress
 */
export const useGetKittyProgress = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyProgress',
    args: [kittyId],
  });
  
  if (data) {
    const [experience, level] = data;
    return { 
      data: { experience: experience.toString(), level }, 
      isError, 
      isLoading 
    };
  }
  
  return { data: null, isError, isLoading };
};

/**
 * Get kitty accessories
 */
export const useGetKittyAccessories = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyAccessories',
    args: [kittyId],
  });
  
  return { data: data || [], isError, isLoading };
};

/**
 * Get kitty name
 */
export const useGetKittyName = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyName',
    args: [kittyId],
  });
  
  return { data, isError, isLoading };
};

/**
 * Get kitty stage
 */
export const useGetKittyStage = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyStageU8',
    args: [kittyId],
  });
  
  return { data, isError, isLoading };
};

/**
 * Get kitty mood
 */
export const useGetKittyMood = (kittyId) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getKittyMoodU8',
    args: [kittyId],
  });
  
  return { data, isError, isLoading };
};

/**
 * Get total kitties
 */
export const useGetTotalKitties = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTotalKitties',
  });
  
  return { 
    data: data ? data.toString() : '0', 
    isError, 
    isLoading 
  };
};

/**
 * Get next kitty ID
 */
export const useGetNextKittyId = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getNextKittyId',
  });
  
  return { 
    data: data ? data.toString() : '0', 
    isError, 
    isLoading 
  };
};

/**
 * Get treasury balance
 */
export const useGetTreasuryBalance = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTreasuryBalance',
  });
  
  return { 
    data: data ? formatEther(data) : '0', 
    isError, 
    isLoading 
  };
};

/**
 * Get accessory price
 */
export const useGetAccessoryPrice = (category) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAccessoryPrice',
    args: [category],
  });
  
  return { 
    data: data ? formatEther(data) : '0', 
    isError, 
    isLoading 
  };
};

/**
 * Get all accessory prices
 */
export const useGetAllAccessoryPrices = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllAccessoryPrices',
  });
  
  return { 
    data: data ? data.map(price => formatEther(price)) : [], 
    isError, 
    isLoading 
  };
};

/**
 * Check if user is deployer
 */
export const useIsDeployer = (account) => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isDeployer',
    args: [account],
  });
  
  return { data: data || false, isError, isLoading };
};

/**
 * Get current time
 */
export const useGetTime = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTime',
  });
  
  return { 
    data: data ? data.toString() : '0', 
    isError, 
    isLoading 
  };
};

// Legacy functions for backward compatibility
export const createKitty = async (name) => {
  const { createKitty: createKittyFn } = useCreateKitty();
  return await createKittyFn(name);
};

export const feedKitty = async (kittyId) => {
  const { feedKitty: feedKittyFn } = useFeedKitty();
  return await feedKittyFn(kittyId);
};

export const playWithKitty = async (kittyId) => {
  const { playWithKitty: playWithKittyFn } = usePlayWithKitty();
  return await playWithKittyFn(kittyId);
};

export const sleepKitty = async (kittyId) => {
  const { sleepKitty: sleepKittyFn } = useSleepKitty();
  return await sleepKittyFn(kittyId);
};

export const cleanKitty = async (kittyId) => {
  const { cleanKitty: cleanKittyFn } = useCleanKitty();
  return await cleanKittyFn(kittyId);
};

export const addAccessoryWithPayment = async (kittyId, accessory, category, value) => {
  const { addAccessoryWithPayment: addAccessoryWithPaymentFn } = useAddAccessoryWithPayment();
  return await addAccessoryWithPaymentFn(kittyId, accessory, category, value);
};

export const addAccessory = async (kittyId, accessory) => {
  const { addAccessory: addAccessoryFn } = useAddAccessory();
  return await addAccessoryFn(kittyId, accessory);
};

export const getKittyOwner = async (kittyId) => {
  const { data } = useGetKittyOwner(kittyId);
  return data;
};

export const getOwnerKitties = async (owner) => {
  const { data } = useGetOwnerKitties(owner);
  return data;
};

export const getKittyStats = async (kittyId) => {
  const { data } = useGetKittyStats(kittyId);
  return data;
};

export const getKittyProgress = async (kittyId) => {
  const { data } = useGetKittyProgress(kittyId);
  return data;
};

export const getKittyAccessories = async (kittyId) => {
  const { data } = useGetKittyAccessories(kittyId);
  return data;
};

export const getKittyName = async (kittyId) => {
  const { data } = useGetKittyName(kittyId);
  return data;
};

export const getKittyStage = async (kittyId) => {
  const { data } = useGetKittyStage(kittyId);
  return data;
};

export const getKittyMood = async (kittyId) => {
  const { data } = useGetKittyMood(kittyId);
  return data;
};

export const getTotalKitties = async () => {
  const { data } = useGetTotalKitties();
  return data;
};

export const getNextKittyId = async () => {
  const { data } = useGetNextKittyId();
  return data;
};

export const getTreasuryBalance = async () => {
  const { data } = useGetTreasuryBalance();
  return data;
};

export const getAccessoryPrice = async (category) => {
  const { data } = useGetAccessoryPrice(category);
  return data;
};

export const getAllAccessoryPrices = async () => {
  const { data } = useGetAllAccessoryPrices();
  return data;
};

export const isDeployer = async (account) => {
  const { data } = useIsDeployer(account);
  return data;
};

export const getTime = async () => {
  const { data } = useGetTime();
  return data;
};

/**
 * Get owner kitties with full data
 */
export const getOwnerKittiesWithData = async (owner) => {
  try {
    const kittyIds = await getOwnerKitties(owner);
    const kittiesWithData = [];
    
    for (const kittyId of kittyIds) {
      const [name, stats, progress, accessories, stage, mood] = await Promise.all([
        getKittyName(kittyId),
        getKittyStats(kittyId),
        getKittyProgress(kittyId),
        getKittyAccessories(kittyId),
        getKittyStage(kittyId),
        getKittyMood(kittyId)
      ]);
      
      kittiesWithData.push({
        id: kittyId.toString(),
        name: name || `Kitty #${kittyId}`,
        stats: stats || { hunger: 0, energy: 0, happiness: 0, health: 0, cleanliness: 0 },
        progress: progress || { experience: '0', level: 1 },
        accessories: accessories || [],
        stage: stage || 0,
        mood: mood || 0
      });
    }
    
    return kittiesWithData;
  } catch (error) {
    console.error('Error getting owner kitties with data:', error);
    return [];
  }
};