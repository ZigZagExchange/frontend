import styled from "styled-components";

const Legend = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const Option = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
`;

const Type = styled.div`
  margin-left: 8px;
`;

const Value = styled.div`
  margin-left: 0px;
  color: ${({positive}) => {
    return positive === undefined ? '#85848A' : ( positive ? '#3EDD96' : '#A13245' )}
  };
`;

export function ChartLegend({open, high, low, close, candleBefore}){
  return (
    <Legend>
      <Option>
        <Type>O</Type>
        <Value
          positive={open ? (candleBefore?.open < open) : undefined}
        >{open ? open : 'NaN'}</Value>
      </Option>

      <Option>
        <Type>H</Type>
        <Value
          positive={high ? (candleBefore?.high <= high) : undefined}
        >{high ? high : 'NaN'}</Value>
      </Option>

      <Option>
        <Type>L</Type>
        <Value
          positive={low ? (candleBefore?.low < low) : undefined}
        >{low ? low : 'NaN'}</Value>
      </Option>

      <Option>
        <Type>C</Type>
        <Value 
          positive={close ? (candleBefore?.close ? (candleBefore.close < close) : undefined) : undefined}
        >{close ? close : 'NaN'}</Value>
      </Option>
    </Legend>
    )
}
