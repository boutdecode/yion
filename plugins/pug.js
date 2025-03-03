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
const path = require('node:path');
const pug = require('pug');
module.exports = ({ folder = 'templates', globals = {} } = {}) => {
    const templateFolder = path.resolve(process.cwd(), folder);
    return (context, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { req, res, container, i18n, assets } = context;
        const templateFunctions = {
            get canonical() {
                return res.routeMatched.generatePath(Object.assign({ locale: this.locale }, req.params), req.query);
            },
            get locale() {
                return req.attributes.locale || container.get('translation.locale', 'en');
            },
            get locales() {
                return container.get('translation.locales', []);
            },
            get route() {
                return res.routeMatched;
            },
            get url() {
                return `${container.get('application.hostname')}${req.uri}`;
            },
            get queries() {
                return req.query;
            },
            t(name, options = {}) {
                if (!i18n) {
                    throw new Error('i18n is not available');
                }
                return i18n.t(name, Object.assign({ lng: templateFunctions.locale }, options));
            },
            setting(name, defaultValue) {
                if (!i18n) {
                    throw new Error('i18n is not available');
                }
                return i18n.t(container.get(`application.${name}`, defaultValue), { lng: templateFunctions.locale });
            },
            asset(name) {
                if (!assets) {
                    throw new Error('assets is not available');
                }
                return assets.get(name);
            }
        };
        context.set('view', {
            render(name, data) {
                res
                    .set('content-type', 'text/html')
                    .set('content-encoding', 'gzip')
                    .send(pug.renderFile(`${templateFolder}/${name}.pug`, Object.assign(Object.assign(Object.assign({}, templateFunctions), globals), data)));
            }
        });
        next();
    });
};
