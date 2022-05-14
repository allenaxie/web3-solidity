import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

// MetaMask gives us window.ethereum object
const { ethereum } = window;
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
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });

    const handleChange = (e, name) => {
        // prevState from react
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    const checkIfWalletIsConnected = async () => {

        try {
            // check if MetaMask is installed
            if (!ethereum) return alert("Please install metamask.");
            // get connected account from metamask
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                // get all transactions
    
            } else {
                console.log('no accounts found');
            }
            
            console.log(accounts);

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }

    }

    const connectWallet = async () => {
        try {
            // check if MetaMask is installed
            if (!ethereum) return alert("Please install metamask.");
            // request a metamask account
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // set current account as first account
            setCurrentAccount(accounts[0]);

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");


        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, [])

    return (
        // wrap entire application with data passed to transactionContext
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange }}>
            {children}
        </TransactionContext.Provider>
    )
}