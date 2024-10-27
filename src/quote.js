"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
function getQuote(fromChainId, fromTokenAddress, toChainId, toTokenAddress, fromAmount, userAddress, uniqueRoutesPerBridge, sort, singleTxOnly, isContractCall) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, params, response, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    apiKey = "YourAPIKeyHere";
                    params = {
                        fromChainId: fromChainId,
                        fromTokenAddress: fromTokenAddress,
                        toChainId: toChainId,
                        toTokenAddress: toTokenAddress,
                        fromAmount: fromAmount,
                        userAddress: userAddress,
                        uniqueRoutesPerBridge: uniqueRoutesPerBridge,
                        sort: sort,
                        singleTxOnly: singleTxOnly,
                        isContractCall: isContractCall,
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    console.log("Fetching quote with parameters:", params);
                    return [4 /*yield*/, axios_1.default.get('https://api.socket.tech/v2/quote', {
                            headers: {
                                "API-KEY": apiKey,
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            params: params,
                        })];
                case 2:
                    response = _c.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_1 = _c.sent();
                    if (axios_1.default.isAxiosError(error_1)) {
                        console.error("Axios error:", (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data);
                        console.error("Error status:", (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.status);
                    }
                    else {
                        console.error("Unexpected error:", error_1);
                    }
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Example usage with actual data
var fromChainId = "137"; // Polygon (MATIC)
var fromTokenAddress = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"; // USDC on Polygon
var toChainId = "56"; // Binance Smart Chain (BSC)
var toTokenAddress = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3"; // BUSD on BSC
var fromAmount = "100000000"; // Amount in the smallest unit (e.g., 100 USDC if using 6 decimals)
var userAddress = "0x3e8cB4bd04d81498aB4b94a392c334F5328b237b"; // User's wallet address
var uniqueRoutesPerBridge = true; // Flag for unique routes
var sort = "fast"; // Sorting criteria
var singleTxOnly = true; // Whether to allow only single transaction
var isContractCall = false; // Whether it's a contract call
getQuote(fromChainId, fromTokenAddress, toChainId, toTokenAddress, fromAmount, userAddress, uniqueRoutesPerBridge, sort, singleTxOnly, isContractCall).then(function (quote) {
    if (quote) {
        console.log("Quote:", JSON.stringify(quote, null, 2));
    }
});
