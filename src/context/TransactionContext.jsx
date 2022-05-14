import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

// MetaMask gives us window.ethereum object
const {ethereum} = window;
// fetch our contract
const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log({
        provider,
        signer,
        transactionContract,
    })
}

export const TransactionProvider = ({ children }) => {
    return (
        // wrap entire application with data passed to transactionContext
        <TransactionContext.Provider value={{ value: 'test' }}>
            {children}
        </TransactionContext.Provider>
    )
}