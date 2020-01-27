import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Mwika from '../abis/Mwika.json'

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

class App extends Component {
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  constructor(props) {
    
    super(props);
    this.state = {
      account: '',
      mwikaHash:'',
      buffer: null,
      contract:null,
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Please use metamask!...')
    }
  }

    async loadBlockchainData() {
    const web3 = window.web3
    // Get the account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    // Get the network
    const networkId = await web3.eth.net.getId()
    const networkData = Mwika.networks[networkId]
    if (networkData) {
      // Get Smart Contract
      // ---> ABI: Mwika.abi
      // ---> Adrress: networkData.address
      const abi = Mwika.abi
      const address = networkData.address
      // Fetch Contract
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      // Get Hash value
      const mwikaHash = await contract.methods.get().call()
      this.setState({ mwikaHash })
    }
    else {
      window.alert('Smart contract has not deployed in detecting network!')
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    // Process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  // Example path: "https://ipfs.infura.io/ipfs/QmZmR8DLQLK8wqSxjEqr4Z1q6u1JGc6ittWBEGAgiMvuWQ"
  // Example hash: "QmZmR8DLQLK8wqSxjEqr4Z1q6u1JGc6ittWBEGAgiMvuWQ"
  onSubmit = (event) => {
    event.preventDefault()
    console.log('submit the document....')
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs responding...', result)
      const mwikaHash = result[0].hash
      this.setState({ mwikaHash})
      if (error) {
        console.error(error);
        return
      }
      this.state.contract.methods.set(mwikaHash).send({ from: this.state.account }).then((r) => {
        return this.setState({ mwikaHash })
    })
  })
}

   render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            BLOCKCHAIN USING IPFS
            <ul className="navbar-nav px-3">
             <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                <small className="text-white">{this.state.account}</small>
              </li>
            </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.mwikaHash}`} alt="" />
                  <p>&nbsp;</p>
                  <p>&nbsp;</p>
                  <h1>Upload File of the day</h1>
                  <form onSubmit={this.onSubmit} >
                    <input type='file' onChange={this.captureFile} />
                    <input type='submit' />
                  </form>
                </div>
              </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;