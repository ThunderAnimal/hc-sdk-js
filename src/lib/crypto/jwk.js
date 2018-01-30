/**
 *
 * @param key
 * @param publicKeyUse
 * @param keyOperations
 * @param algorithm
 * @param keyID
 * @param x509URL
 * @param x509CertificateChain
 * @param x509CertificateSHA1Thumbprint
 * @param x509CertificateSHA256Thumbprint
 * @param params array of additional stuff
 * @returns {{kty: *, use: *, key_ops: *, alg: *, kid: *, x5u: *, x5c: *, x5t: *, "x5t#S256": *}}
 *
 * Access to JWKs containing non-public key material by parties without
 * legitimate access to the non-public information MUST be prevented.
 * This can be accomplished by encrypting the JWK when potentially
 * observable by such parties to prevent the disclosure of private or
 * symmetric key values.
 */
const createKey = (
    key,
    publicKeyUse = null,
    keyOperations = null,
    algorithm,
    keyID = null,
    x509URL = null,
    x509CertificateChain = null,
    x509CertificateSHA1Thumbprint = null,
    x509CertificateSHA256Thumbprint = null,
    ...params
) => ({
    /**
     * The "kty" (key type) parameter identifies the cryptographic algorithm
     * family used with the key, such as "RSA" or "EC". The "kty" value is a
     * case-sensitive string.  This member MUST be present in a JWK.
     */
    kty: key,

    /**
     * The "use" (public key use) parameter identifies the intended use of
     * the public key.  The "use" parameter is employed to indicate whether
     * a public key is used for encrypting data or verifying the signature
     * on data.

     * Values defined by this specification are:
     * - "sig" (signature)
     * - "enc" (encryption)
     *
     * Other values MAY be used.  The "use" value is a case-sensitive
     * string.  Use of the "use" member is OPTIONAL, unless the application
     * requires its presence.
     */
    use: publicKeyUse,

    /**
     * The "key_ops" (key operations) parameter identifies the operation(s)
     * for which the key is intended to be used.  The "key_ops" parameter is
     * intended for use cases in which public, private, or symmetric keys
     * may be present.

     * Its value is an array of key operation values.  Values defined by
     * this specification are:

     * - "sign" (compute digital signature or MAC)
     * - "verify" (verify digital signature or MAC)
     * - "encrypt" (encrypt content)
     * - "decrypt" (decrypt content and validate decryption, if applicable)
     * - "wrapKey" (encrypt key)
     * - "unwrapKey" (decrypt key and validate decryption, if applicable)
     * - "deriveKey" (derive key)
     * - "deriveBits" (derive bits not to be used as a key)

     * (Note that the "key_ops" values intentionally match the "KeyUsage"
     * values defined in the Web Cryptography API
     * [W3C.CR-WebCryptoAPI-20141211] specification.)

     * Other values MAY be used.  The key operation values are case-
     * sensitive strings.  Duplicate key operation values MUST NOT be
     * present in the array.  Use of the "key_ops" member is OPTIONAL,
     * unless the application requires its presence.

     * Multiple unrelated key operations SHOULD NOT be specified for a key
     * because of the potential vulnerabilities associated with using the
     * same key with multiple algorithms.  Thus, the combinations "sign"
     * with "verify", "encrypt" with "decrypt", and "wrapKey" with
     * "unwrapKey" are permitted, but other combinations SHOULD NOT be used.
     */
    key_ops: keyOperations,

    /**
     * The "alg" (algorithm) parameter identifies the algorithm intended for
     * use with the key.
     */
    alg: algorithm,

    /**
     * The "kid" (key ID) parameter is used to match a specific key.  This
     * is used, for instance, to choose among a set of keys within a JWK Set
     * during key rollover.  The structure of the "kid" value is
     * unspecified.  When "kid" values are used within a JWK Set, different
     * keys within the JWK Set SHOULD use distinct "kid" values.  (One
     * example in which different keys might use the same "kid" value is if
     * they have different "kty" (key type) values but are considered to be
     * equivalent alternatives by the application using them.)  The "kid"
     * value is a case-sensitive string.  Use of this member is OPTIONAL.
     * When used with JWS or JWE, the "kid" value is used to match a JWS or
     * JWE "kid" Header Parameter value.
     */
    kid: keyID,

    x5u: x509URL,
    x5c: x509CertificateChain,
    x5t: x509CertificateSHA1Thumbprint,
    'x5t#S256': x509CertificateSHA256Thumbprint,
    ...params,
});

const makeJWK = (...keys) => ({ keys });

export default makeJWK;

/**
 *
 The following example JWK Set contains two symmetric keys represented
 as JWKs: one designated as being for use with the AES Key Wrap
 algorithm and a second one that is an HMAC key.  (Line breaks within
 values are for display purposes only.)

 {"keys":
   [
     {"kty":"oct",
      "alg":"A128KW",
      "k":"GawgguFyGrWKav7AX4VKUg"},

     {"kty":"oct",
      "k":"AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75
 aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow",
      "kid":"HMAC key used in JWS spec Appendix A.1 example"}
   ]
 }
 */
