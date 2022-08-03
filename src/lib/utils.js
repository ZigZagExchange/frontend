import { useEffect } from "react";
import { BigNumber } from "ethers";
import isString from "lodash/isString";
import get from "lodash/get";

export const getThemeValue = (path, fallback) => (theme) =>
  get(theme, path, fallback);

export function formatUSD(floatNum) {
  const num = parseFloat(floatNum || 0)
    .toFixed(2)
    .split(".");
  num[0] = parseInt(num[0]).toString();
  return num.join(".");
}

export function formatMillonAmount(floatNum) {
  if (floatNum >= 10000000 && floatNum < 100000000) {
    floatNum = floatNum / 1000000;
    floatNum = floatNum.toFixed(3);
    return floatNum + "M";
  } else if (floatNum >= 100000000 && floatNum < 1000000000) {
    floatNum = floatNum / 1000000;
    floatNum = floatNum.toFixed(2);
    return floatNum + "M";
  } else if (floatNum >= 1000000000 && floatNum < 10000000000) {
    floatNum = floatNum / 1000000;
    floatNum = floatNum.toFixed(1);
    return floatNum + "M";
  } else {
    return addComma(floatNum);
  }
}

export function addComma(floatNum) {
  const str =
    typeof floatNum === "string" ? floatNum.replaceAll(",", "") : floatNum;
  const parts = Number(str).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return expToNumber(parts.join("."));
}

export function expToNumber(number) {
  const data = String(number).split(/[eE]/);
  if (data.length === 1) return data[0];

  let z = "",
    sign = number < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
}

export function formatToken(floatNum, token = "USDC") {
  let isUSD = false;
  if (
    token === "USDC" ||
    token === "USDT" ||
    token === "BUSD" ||
    token === "DAI" ||
    token === "FRAX"
  )
    isUSD = true;
  return floatNum !== "" && isUSD
    ? addComma(parseFloat(floatNum).toFixed(2))
    : addComma(parseFloat(floatNum).toFixed(7));
}

export function formatAmount(amount, currency) {
  return parseFloat(amount / Math.pow(10, currency.decimals)).toFixed(
    Math.min(5, currency.decimals)
  );
}

export function formatPrice(input) {
  const inputNumber = Number(input);
  if (Number.isNaN(inputNumber)) return "--";
  if (!Number.isFinite(inputNumber)) return "--";

  let outputNumber;
  if (inputNumber > 99999) {
    outputNumber = inputNumber.toFixed(0);
  } else if (inputNumber > 9999) {
    outputNumber = inputNumber.toFixed(1);
  } else if (inputNumber > 999) {
    outputNumber = inputNumber.toFixed(2);
  } else if (inputNumber > 99) {
    outputNumber = inputNumber.toFixed(3);
  } else if (inputNumber > 9) {
    outputNumber = inputNumber.toFixed(4);
  } else if (inputNumber > 1) {
    outputNumber = inputNumber.toFixed(5);
  } else {
    outputNumber = inputNumber.toPrecision(6);
  }
  // remove trailing zero's
  return Number(outputNumber).toString();
}

export function toBaseUnit(value, decimals) {
  if (!isString(value)) {
    throw new Error("Pass strings to prevent floating point precision issues.");
  }

  const base = BigNumber.from(10).pow(decimals);

  if (value.charAt(0) === "-") {
    value = value.substring(1);
  }

  if (value === ".") {
    throw new Error(
      `Invalid value ${value} cannot be converted to` +
        ` base unit with ${decimals} decimals.`
    );
  }

  // Split it into a whole and fractional part
  let comps = value.split(".");
  if (comps.length > 2) {
    throw new Error("Too many decimal points");
  }

  let whole = comps[0],
    fraction = comps[1];

  if (!whole) {
    whole = "0";
  }
  if (!fraction) {
    fraction = "0";
  }
  if (fraction.length > decimals) {
    throw new Error("Too many decimal places");
  }

  while (fraction.length < decimals) {
    fraction += "0";
  }

  whole = BigNumber.from(whole);
  fraction = BigNumber.from(fraction);
  return BigNumber.from(whole.mul(base).add(fraction).toString(10));
}

export function numStringToSymbol(str, decimals) {
  const lookup = [
    { value: 1e6, symbol: "M" },
    // { value: 1e3, symbol: "k" }, uncomment for thousands abbreviation
  ];

  const item = lookup.find((item) => str >= item.value);

  if (!item) return str;
  return (str / item.value).toFixed(decimals) + item.symbol;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

function isLessThan24HourAgo(date) {
  // 👇️                    hour  min  sec  milliseconds
  const twentyFourHrInMs = 24 * 60 * 60 * 1000;

  const twentyFourHoursAgo = Date.now() - twentyFourHrInMs;

  return date > twentyFourHoursAgo;
}

export function formatDate(date) {
  if (isLessThan24HourAgo(date)) {
    return [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(":");
  } else {
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join("-");
  }
}

export function formatDateTime(date) {
  const timestr = [
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
    padTo2Digits(date.getSeconds()),
  ].join(":");
  const datestr = [
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
    date.getFullYear(),
  ].join("-");
  return datestr + " " + timestr;
}

export function HideMenuOnOutsideClicked(ref, hideMenu) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        hideMenu(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, hideMenu]);
}

export function shortenAddress(address, chars) {
  return `${address.slice(0, chars)}•••${address.slice(-chars)}`;
}
