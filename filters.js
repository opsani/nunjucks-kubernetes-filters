validateDnsSubdomain = function(name) {
    // Check length > 0 and < 253
    if (name.length == 0) {
        throw new Error('DNS Subdomain Names cannot be zero characters in length');
    }
    if (name.length > 253) {
        throw new Error('DNS Subdomain Names cannot be more than 253 characters in length');
    }

    // Check contains only lowercase alphanumeric characters, '-' or '.'
    let nameRegex = /^[a-z0-9\.\-]+$/;
    if (!nameRegex.test(name)) {
        throw new Error('DNS Subdomain Names must contain only lowercase alphanumeric characters, \'-\' or \'.\'');
    }

    // Check starts and ends with an alphanumeric character
    let boundaryRegex = /[a-z0-9]/;
    if (!boundaryRegex.test(name.slice(0, 1))) {
        throw new Error('DNS Subdomain Names must start with an alphanumeric character');
    }
    if (!boundaryRegex.test(name.slice(-1))) {
        throw new Error('DNS Subdomain Names must end with an alphanumeric character');
    }

    return true;
};

isValidDnsSubdomain = function(str) {
    try {
        return validateDnsSubdomain(str);
    } catch (e) {
        return false;
    }
};

dnsSubdomainify = function(name) {
    /*
    Valid DNS Subdomain Names conform to [RFC 1123](https://tools.ietf.org/html/rfc1123) and must:
        * contain no more than 253 characters
        * contain only lowercase alphanumeric characters, '-' or '.'
        * start with an alphanumeric character
        * end with an alphanumeric character

    See https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-subdomain-names
    */

    // lowercase alphanumerics
    name = name.toLowerCase();

    // replace slashes with dots
    name = name.replace(/\//g, '.');

    // replace whitespace with hyphens
    name = name.replace(/\s/g, '-');

    // strip any remaining disallowed characters
    name = name.replace(/[^a-z0-9\.\-]+/g, '')

    // truncate to our maximum length
    name = name.substring(0, 253)

    // ensure starts with an alphanumeric by prefixing with `0-`
    let boundaryRegex = /[a-z0-9]/;
    if (!boundaryRegex.test(name.slice(0, 1))) {
        name = ('0-' + name).substring(0, 253);
    }

    // ensure ends with an alphanumeric by suffixing with `-1`
    if (!boundaryRegex.test(name.slice(-1))) {
        name = name.substring(0, 251) + '-1';
    }

    // validate our transformed value
    validateDnsSubdomain(name);

    return name;
};

escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

dnsLabelize = function(name) {
    /*
    Valid DNS Label Names conform to [RFC 1123](https://tools.ietf.org/html/rfc1123) and must:
        * must be 63 characters or less (cannot be empty)
        * must begin and end with an alphanumeric character ([a-z0-9A-Z])
        * may contain dashes (-), underscores (_), dots (.), and alphanumerics between

    See https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names
    */

    // replace slashes with underscores
    name = name.replace(/\//g, '_');

    // replace whitespace with hyphens
    name = name.replace(/\s/g, '-');

    // strip any remaining disallowed characters
    name = name.replace(/[^a-z0-9A-Z\.\-_]+/g, '')

    // truncate to our maximum length
    name = name.substring(0, 63)

    // ensure starts with an alphanumeric by prefixing with `0-`
    let boundaryRegex = /[a-z0-9A-Z]/;
    if (!boundaryRegex.test(name.slice(0, 1))) {
        name = ('0-' + name).substring(0, 63);
    }

    // ensure ends with an alphanumeric by suffixing with `-1`
    if (!boundaryRegex.test(name.slice(-1))) {
        name = name.substring(0, 61) + '-1';
    }

    return name;
}

module.exports = {
    validateDnsSubdomain,
    isValidDnsSubdomain,
    dnsSubdomainify,
    escapeRegExp,
    dnsLabelize,
}
