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

    return transactionContract;
}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    // store in localstorage so it doesnt reset everytime we refresh our browser
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        // prevState from react
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            const transactionContract = getEthereumContract();
            // .getAllTransactions() method from our smart contract
            const availableTransactions = await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18), //convert hexadecimal in GWEI to ETH
            }))
            console.log(structuredTransactions);
            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
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
                getAllTransactions();
            } else {
                console.log('no accounts found');
            }
            
            console.log(accounts);

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }

    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem('transactionCount', transactionCount);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
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

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            // convery value to hexadecimal -> GWEI (unit of ether)
            const parsedAmount = ethers.utils.parseEther(amount);

            // send ethereum
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //must be hexadecimal value -> GWEI 
                    value: parsedAmount._hex, // 0.00001
                }]
            })

            // store transaction to blockchain
            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
            // Set loading state 
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

            window.reload();
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, [])

    return (
        // wrap entire application with data passed to transactionContext
        <TransactionContext.Provider value={{ 
            connectWallet, 
            currentAccount, 
            formData, 
            handleChange, 
            sendTransaction,
            transactions,
            isLoading,
            }}
        >
            {children}
        </TransactionContext.Provider>
    )
}