import { ethers } from "ethers";

export const MAX_ALLOWANCE = ethers.BigNumber.from(
  "3402823669209384634633746074310"
);

export const balanceBundlerMainnet =
  "0xb1f8e55c7f64d203c1400b9d8555d050f94adf39";
export const balanceBundlerAddress =
  "0x1b7ad12c73b9fea574cd2320650676c0a0bde8a0";

export const requestTokens = {
  421613: [
    ethers.constants.AddressZero, // used to request ETH tokens
    "0xEA70a40Df1432A1b38b916A51Fb81A4cc805a963",
    "0x4cdfA8137455123723851349d705a0023F73896A",
    "0x3d9835F9cB196f8A88b0d4F9586C3E427af1Ffe0",
  ],
};
