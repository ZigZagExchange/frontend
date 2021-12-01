import React from "react";
import "./EstimateCard.css";
const EstimateCard = (props) => {
    return (
        <>
            <div className={props.className}>
                <h6>{props.estimateText}</h6>
                <h2>{props.estimateNumber}</h2>
                <p>{props.estimateValue}</p>
            </div>
        </>
    );
};

export default EstimateCard;
