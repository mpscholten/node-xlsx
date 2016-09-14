var XLSX = require('./lib/xlsx-style');
var StyledContent = require('./styledcontent');

const isBoolean = maybeBoolean => typeof maybeBoolean === 'boolean';
const isNumber = maybeNumber => typeof maybeNumber === 'number';
const isString = maybeString => typeof maybeString === 'string';

const originDate = new Date(Date.UTC(1899, 11, 30));

const buildExcelDate = (value, is1904) => {
  const epoch = Date.parse(value + (is1904 ? 1462 : 0));
  return (epoch - originDate) / (864e5);
};

const buildSheetFromMatrix = (data, options = {}) => {
  const workSheet = {};
  const range = {s: {c: 1e7, r: 1e7}, e: {c: 0, r: 0}};
  for (let R = 0; R !== data.length; ++R) {
    for (let C = 0; C !== data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      if (data[R][C] === null) {
        continue; // eslint-disable-line
      }
      const val = data[R][C];
      const cell = {};

      if (typeof val === 'object' && val instanceof StyledContent) {
          cell.v = val.content;
          cell.s = val.style;
      } else {
          cell.v = val;
      }

      const cellRef = XLSX.utils.encode_cell({c: C, r: R});
      if (isNumber(cell.v)) {
        cell.t = 'n';
      } else if (isBoolean(cell.v)) {
        cell.t = 'b';
      } else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.v = buildExcelDate(cell.v);
        cell.z = XLSX.SSF._table[14]; // eslint-disable-line no-underscore-dangle
      } else {
        cell.t = 's';
      }

      if (options.cellCallback) {
          options.cellCallback(cell, C, R);
      }

      workSheet[cellRef] = cell;
    }
  }
  if (range.s.c < 1e7) {
    workSheet['!ref'] = XLSX.utils.encode_range(range);
  }
  if (options['!cols']) {
    workSheet['!cols'] = options['!cols'];
  }
  if (options['!merges']) {
    workSheet['!merges'] = options['!merges'];
  }
  return workSheet;
};

module.exports = {
    buildSheetFromMatrix,
    isBoolean,
    isNumber,
    isString
};
