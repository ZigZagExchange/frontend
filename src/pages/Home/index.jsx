import React from "react";
// css
import "./style.css";
// components
import EstimateCard from "../../utills/EstimateCard/EstimateCard";
import HomeFields from "../../components/HomeComponents/HomeFields/HomeFields";
import HomeTable from "../../components/HomeComponents/HomeTable/HomeTable";
import Header from "../../layout/header/Header";
const Home = () => {
  return (
    <>
      <Header />
      <div className="home_section">
        <div className="home_container">
          {/* estimate cards section */}
          <div className="hs_top">
            <EstimateCard
              // getting data from estimate card component through props
              className="estimate_card ec_bg1"
              estimateText="Estimated Total Value"
              estimateNumber="$3,814.18"
              estimateValue="=1.203ETH"
            />
            <span>=</span>
            <EstimateCard
              // getting data from estimate card component through props
              className="estimate_card ec_bg2"
              estimateText="Estimated Value on Ethereum"
              estimateNumber="$3,704.70"
              estimateValue="=1.169ETH"
            />
            <span>+</span>
            <EstimateCard
              // getting data from estimate card component through props
              className="estimate_card ec_bg2"
              estimateText="Estimated Value on ZKSync"
              estimateNumber="$109.48"
              estimateValue="=0.035ETH"
            />
          </div>
          {/* Home Fields */}
          <HomeFields />
          {/* Home Table */}
          <HomeTable />
        </div>
      </div>
    </>
  );
};

export default Home;
