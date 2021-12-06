import { BigNumber } from 'ethers'
import isString from 'lodash/isString'

export function toBaseUnit(value, decimals) {
    if (!isString(value)) {
      throw new Error('Pass strings to prevent floating point precision issues.')
    }

    const base = BigNumber.from(10).pow(decimals);
  
    if (value.charAt(0) === '-') {
      value = value.substring(1);
    }
  
    if (value === '.') { 
      throw new Error(
      `Invalid value ${value} cannot be converted to`
      + ` base unit with ${decimals} decimals.`); 
    }
  
    // Split it into a whole and fractional part
    let comps = value.split('.');
    if (comps.length > 2) { throw new Error('Too many decimal points'); }
  
    let whole = comps[0], fraction = comps[1];
  
    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > decimals) { 
      throw new Error('Too many decimal places'); 
    }
  
    while (fraction.length < decimals) {
      fraction += '0';
    }
  
    whole = BigNumber.from(whole);
    fraction = BigNumber.from(fraction);    
    return BigNumber.from(whole.mul(base).add(fraction).toString(10));
  }