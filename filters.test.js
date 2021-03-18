const { test } = require('@jest/globals');
const nunjucks = require('nunjucks');
const filters = require('./filters');

describe('validateDnsSubdomain', () => {
    test('returns true for valid DNS Subdomain Names', () => {
        expect(validateDnsSubdomain('simple')).toBe(true);
    });

    test('throws when name length is zero', () => {
        expect(() => validateDnsSubdomain('')).toThrow('DNS Subdomain Names cannot be zero characters in length');
    });

    test('throws when name is longer than 253 characters', () => {
        let name = '0'.repeat(255);
        expect(() => validateDnsSubdomain(name)).toThrow('DNS Subdomain Names cannot be more than 253 characters in length');
    });

    test('throws when name contains uppercase characters', () => {
        expect(() => validateDnsSubdomain('INVALID')).toThrow("DNS Subdomain Names must contain only lowercase alphanumeric characters, '-' or '.'");
    });

    test('throws when name contains special characters other than hyphens and dots', () => {
        expect(() => validateDnsSubdomain('invalid!')).toThrow("DNS Subdomain Names must contain only lowercase alphanumeric characters, '-' or '.'");
    });

    test('throws when name starts with a hyphen or dot', () => {
        expect(() => validateDnsSubdomain('-invalid')).toThrow('DNS Subdomain Names must start with an alphanumeric character');
        expect(() => validateDnsSubdomain('.invalid')).toThrow('DNS Subdomain Names must start with an alphanumeric character');
    });

    test('throws when name ends with a hyphen or dot', () => {
        expect(() => validateDnsSubdomain('invalid-')).toThrow('DNS Subdomain Names must end with an alphanumeric character');
        expect(() => validateDnsSubdomain('invalid.')).toThrow('DNS Subdomain Names must end with an alphanumeric character');
    });
});

describe('dnsSubdomainify', () => {
    test('truncates to 253 characters', () => {
        let name = '0'.repeat(300);
        expect(dnsSubdomainify(name).length).toBe(253);
    });

    test('lowercases alphabetic characters', () => {
        expect(dnsSubdomainify('ABCD')).toBe('abcd');
    });

    test('replaces slashes with dots', () => {
        expect(dnsSubdomainify('test.opsani.com/my-great-app')).toBe('test.opsani.com.my-great-app');
    });

    test('replaces whitespace with hyphens', () => {
        expect(dnsSubdomainify('test.opsani.com/My Amazing App')).toBe('test.opsani.com.my-amazing-app');
    });

    test('strips non-alphanumerics', () => {
        expect(dnsSubdomainify("test.opsani.com/Blake's Super Awesome App!")).toBe('test.opsani.com.blakes-super-awesome-app');
    });

    test('ensure starts with an alphanumeric', () => {
        expect(dnsSubdomainify("..test.opsani.com/Blake's Super Awesome App!")).toBe('0-..test.opsani.com.blakes-super-awesome-app');
    });

    test('ensure ends with an alphanumeric', () => {
        expect(dnsSubdomainify("test.opsani.com/Blake's Super Awesome App!-")).toBe('test.opsani.com.blakes-super-awesome-app--1');
    });

    test('pathological inputs are handled', () => {
        let name = '.'.repeat(253);
        let expected = '0-.........................................................................................................................................................................................................................................................-1';
        expect(dnsSubdomainify(name)).toBe(expected);
    });
});

describe('dnsLabelize', () => {
    test('truncates to 63 characters', () => {
        let name = '0'.repeat(100);
        expect(dnsLabelize(name).length).toBe(63);
    });

    test('replaces slashes with underscores', () => {
        expect(dnsLabelize('test.opsani.com/my-great-app')).toBe('test.opsani.com_my-great-app');
    });

    test('replaces whitespace with hyphens', () => {
        expect(dnsLabelize('test.opsani.com/My Amazing App')).toBe('test.opsani.com_My-Amazing-App');
    });

    test('strips non-alphanumerics', () => {
        expect(dnsLabelize("test.opsani.com/Blake's Super Awesome App!")).toBe('test.opsani.com_Blakes-Super-Awesome-App');
    });

    test('ensure starts with an alphanumeric', () => {
        expect(dnsLabelize("..test.opsani.com/Blake's Super Awesome App!")).toBe('0-..test.opsani.com_Blakes-Super-Awesome-App');
    });

    test('ensure ends with an alphanumeric', () => {
        expect(dnsLabelize("test.opsani.com/Blake's Super Awesome App!-")).toBe('test.opsani.com_Blakes-Super-Awesome-App--1');
    });

    test('pathological inputs are handled', () => {
        let name = '.'.repeat(100);
        let expected = '0-...........................................................-1';
        expect(dnsLabelize(name)).toBe(expected);
    });
});

describe('nunjucks rendering', () => {
    test('renderString', () => {
        let nunjucksEnv = new nunjucks.Environment();
        nunjucksEnv.addFilter('dnsSubdomainify', dnsSubdomainify);
        nunjucksEnv.addFilter('escapeRegExp', escapeRegExp);
        nunjucksEnv.addFilter('dnsLabelize', dnsLabelize);

        const templateContext = {
            optimizer: 'testing.opsani.com/My Super Amazing App Extravaganza!',
        }
        output = nunjucksEnv.renderString("{{ optimizer | dnsSubdomainify }}\n{{ optimizer | dnsLabelize }}", templateContext);
        expect(output).toBe('testing.opsani.com.my-super-amazing-app-extravaganza\ntesting.opsani.com_My-Super-Amazing-App-Extravaganza');
    });
});
