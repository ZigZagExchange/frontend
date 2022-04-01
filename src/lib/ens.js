import Web3 from "web3";

let contract;
const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "contract ENS", name: "_ens", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address[]", name: "addresses", type: "address[]" },
    ],
    name: "getNames",
    outputs: [{ internalType: "string[]", name: "r", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
];

function getContract() {
  if (!contract) {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
      )
    );

    contract = new web3.eth.Contract(
      CONTRACT_ABI,
      "0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C"
    );
  }

  return contract;
}

export const getENSName = async (address) => {
  const ReverseRecords = getContract();
  const name = await ReverseRecords.methods.getNames([address]).call();
  if (name && name[0] && name[0] !== "") return name;
};
