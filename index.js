"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_module_1 = require("node:module");
const dotenv_1 = __importDefault(require("dotenv"));
const yion_1 = require("yion");
const bodyParser = __importStar(require("@boutdecode/body-parser"));
const logger = __importStar(require("@boutdecode/logger"));
const session = __importStar(require("@boutdecode/session"));
const encoding = __importStar(require("@boutdecode/encoding"));
const i18n = __importStar(require("@boutdecode/i18n"));
const assets_1 = require("./plugins/assets");
dotenv_1.default.config();
const bootstrap = ({ config, plugins = [] }) => {
    var _a;
    const require = (0, node_module_1.createRequire)(import.meta.url);
    const container = require('./plugins/container');
    const moduleLoader = require('./plugins/module-loader');
    const apps = [];
    const app = (0, yion_1.createApp)();
    apps.push(app);
    let api;
    if (config.api) {
        const { createApi } = require('@boutdecode/open-api');
        const apiDoc = require('@boutdecode/open-api/plugins/open-api-doc');
        const cors = require('@boutdecode/open-api/plugins/cors');
        api = createApi({ openapi: config.api });
        if (config.cors) {
            api.use(cors(config.cors));
        }
        app.use(apiDoc(api, config.api));
        apps.push(api);
    }
    const server = (0, yion_1.createServer)(...apps);
    app.use(container(config));
    app.use(logger());
    app.use(bodyParser());
    app.use(encoding());
    app.use(session());
    if (config.assets) {
        app.use((0, assets_1.assets)(config.assets));
    }
    if (config.translation) {
        app.use(i18n(config.translation));
    }
    if (config.view) {
        const plugin = require(`./plugins/${((_a = config.view) === null || _a === void 0 ? void 0 : _a.render) || 'jsx'}`);
        app.use(plugin(config.view));
    }
    if (config.store) {
        const { plugin } = require('@boutdecode/store');
        app.use(plugin(config.store));
    }
    plugins.forEach(plugin => app.use(plugin(config)));
    app.use(moduleLoader({ modules: config.modules, config, app, api }));
    server.listen(process.env.NODE_PORT || (config === null || config === void 0 ? void 0 : config.application.port))
        // eslint-disable-next-line no-console
        .on('listening', () => console.log(`🤖 Server starting on port ${process.env.NODE_PORT}.`));
    return { app, api, server };
};
module.exports = {
    bootstrap, createApp: yion_1.createApp, createServer: yion_1.createServer, bodyParser, logger, session, encoding, i18n, assets: assets_1.assets
};
