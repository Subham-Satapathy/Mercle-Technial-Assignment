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
var _a = require('alchemy-sdk'), Alchemy = _a.Alchemy, Network = _a.Network;
var ethers = require('ethers').ethers;
// Define the USDC contract address for each network, including Ethereum
var usdcAddresses = {
    Polygon: "0x2791Bca1f11d6B24d0A3D1d4c7B4d0B0dB1E24D1", // USDC contract on Polygon
    Arbitrum: "0xFF970A61A04B1ca14586C5909B1AE4DC4fA16D51", // USDC contract on Arbitrum
    Base: "0xA0b86991c6218b36c1d19d4a2e9EB0cE3606EB48", // USDC contract on Base
    Gnosis: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8c7f54", // USDC contract on Gnosis
    Blast: "0x4dbcdf9b62e891a7cec5a2568c3f4faf9e8c7f54", // USDC contract on Blast
    Ethereum: "0xA0b86991c6218b36c1d19d4a2e9EB0cE3606EB48" // USDC contract on Ethereum
};
// Define the Alchemy settings for each network
var alchemySettings = {
    Polygon: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.MATIC_MAINNET },
    Arbitrum: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.ARB_MAINNET },
    Base: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.BASE_MAINNET },
    Gnosis: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.GNOSIS_MAINNET },
    Blast: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.ETH_MAINNET },
    Ethereum: { apiKey: 'H0rLcvLPzW91UG2buEzbfjIBJOM65NQA', network: Network.ETH_MAINNET } // Alchemy settings for Ethereum
};
// Function to fetch USDC balances concurrently
function fetchUSDCBalance(address) {
    return __awaiter(this, void 0, void 0, function () {
        var balances;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    balances = {};
                    return [4 /*yield*/, Promise.all(Object.keys(usdcAddresses).map(function (chain) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, apiKey, network, alchemy, balance, usdcBalance, formattedBalance, error_1;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = alchemySettings[chain], apiKey = _a.apiKey, network = _a.network;
                                        alchemy = new Alchemy({ apiKey: apiKey, network: network });
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, alchemy.core.getTokenBalances(address, [usdcAddresses[chain]])];
                                    case 2:
                                        balance = _c.sent();
                                        usdcBalance = ((_b = balance.tokenBalances[0]) === null || _b === void 0 ? void 0 : _b.tokenBalance) || '0';
                                        formattedBalance = ethers.formatUnits(usdcBalance, 6);
                                        balances[chain] = formattedBalance; // Correctly index the balances object
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_1 = _c.sent();
                                        console.error("Error fetching balance from ".concat(chain, ":"), error_1);
                                        balances[chain] = 'Error'; // Store error in balances object
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    console.log('User USDC Balances:', balances);
                    return [2 /*return*/];
            }
        });
    });
}
// Example usage
var userAddress = "0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341"; // Replace with the actual user address
fetchUSDCBalance(userAddress).catch(console.error);
