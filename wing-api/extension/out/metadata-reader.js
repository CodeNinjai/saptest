"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateYeomanSet = void 0;
const js_base64_1 = require("js-base64");
const DELIMITER = ",";
function decode(simpleExtensionsMetadata) {
    simpleExtensionsMetadata = simpleExtensionsMetadata
        .split(DELIMITER)
        .map(js_base64_1.Base64.decode)
        .join(DELIMITER);
    return simpleExtensionsMetadata;
}
function toArray(simpleExtensionsMetadata) {
    return JSON.parse(`[${simpleExtensionsMetadata}]`);
}
function parseMetadata(simpleExtensionsMetadata) {
    try {
        simpleExtensionsMetadata = decode(simpleExtensionsMetadata);
        return toArray(simpleExtensionsMetadata);
    }
    catch (e) {
        throw new Error(`Fatal error ${e} while parsing simple extensions metadata string: ${simpleExtensionsMetadata}`);
    }
}
function calculateYeomanSet(simpleExtensionsMetadata = "") {
    try {
        const simpleMetadata = parseMetadata(simpleExtensionsMetadata);
        return simpleMetadata.reduce((all, datum) => all.concat(datum.yeomanPackages || []), []);
    }
    catch (e) {
        console.error(e);
        return [];
    }
}
exports.calculateYeomanSet = calculateYeomanSet;
//# sourceMappingURL=metadata-reader.js.map