import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "lib/api";
import { networkSelector } from "lib/store/features/api/apiSlice";
import ListBox from "components/atoms/ListBox";

const networkLists = [
  { id: 1, name: "zkSync - Mainnet", value: 1, url: "#" },
  { id: 2, name: "zkSync - Rinkeby", value: 1000, url: "#" },
];

const NetworkSelection = ({ className }) => {
  const network = useSelector(networkSelector);

  const [selectedItem, setSelectedItem] = useState(
    networkLists.find((item) => item.value === network)
  );

  const onChangeNetwork = (item) => {
    setSelectedItem(item);
    api.setAPIProvider(parseInt(item.value));
    api.refreshNetwork().catch((err) => {
      console.log(err);
    });
  };
  return (
    <div className={className}>
      <ListBox
        options={networkLists}
        setSelectedItem={onChangeNetwork}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default NetworkSelection;
