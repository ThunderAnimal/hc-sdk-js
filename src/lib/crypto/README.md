# [JWK](https://tools.ietf.org/html/rfc7517)


## Examples


### Public Keys

The following example JWK Set contains two public keys represented as
JWKs: one using an Elliptic Curve algorithm and a second one using an
RSA algorithm.  The first specifies that the key is to be used for
encryption.  The second specifies that the key is to be used with the
"RS256" algorithm.  Both provide a key ID for key matching purposes.
In both cases, integers are represented using the base64url encoding
of their big-endian representations.  (Line breaks within values are
for display purposes only.)
   
```
     {"keys":
       [
         {"kty":"EC",
          "crv":"P-256",
          "x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
          "y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM",
          "use":"enc",
          "kid":"1"},

         {"kty":"RSA",
          "n": "0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx
     4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMs
     tn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2
     QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbI
     SD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqb
     w0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
          "e":"AQAB",
          "alg":"RS256",
          "kid":"2011-04-29"}
       ]
     }
```


### Private Keys
    
The following example JWK Set contains two keys represented as JWKs
containing both public and private key values: one using an Elliptic
Curve algorithm and a second one using an RSA algorithm.  This
example extends the example in the previous section, adding private
key values.  (Line breaks within values are for display purposes
only.)

```
{"keys":
       [
         {"kty":"EC",
          "crv":"P-256",
          "x":"MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
          "y":"4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM",
          "d":"870MB6gfuTJ4HtUnUvYMyJpr5eUZNP4Bk43bVdj3eAE",
          "use":"enc",
          "kid":"1"},

         {"kty":"RSA",
          "n":"0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4
     cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMst
     n64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2Q
     vzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbIS
     D08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw
     0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw",
          "e":"AQAB",
          "d":"X4cTteJY_gn4FYPsXB8rdXix5vwsg1FLN5E3EaG6RJoVH-HLLKD9
     M7dx5oo7GURknchnrRweUkC7hT5fJLM0WbFAKNLWY2vv7B6NqXSzUvxT0_YSfqij
     wp3RTzlBaCxWp4doFk5N2o8Gy_nHNKroADIkJ46pRUohsXywbReAdYaMwFs9tv8d
     _cPVY3i07a3t8MN6TNwm0dSawm9v47UiCl3Sk5ZiG7xojPLu4sbg1U2jx4IBTNBz
     nbJSzFHK66jT8bgkuqsk0GjskDJk19Z4qwjwbsnn4j2WBii3RL-Us2lGVkY8fkFz
     me1z0HbIkfz0Y6mqnOYtqc0X4jfcKoAC8Q",
          "p":"83i-7IvMGXoMXCskv73TKr8637FiO7Z27zv8oj6pbWUQyLPQBQxtPV
     nwD20R-60eTDmD2ujnMt5PoqMrm8RfmNhVWDtjjMmCMjOpSXicFHj7XOuVIYQyqV
     WlWEh6dN36GVZYk93N8Bc9vY41xy8B9RzzOGVQzXvNEvn7O0nVbfs",
          "q":"3dfOR9cuYq-0S-mkFLzgItgMEfFzB2q3hWehMuG0oCuqnb3vobLyum
     qjVZQO1dIrdwgTnCdpYzBcOfW5r370AFXjiWft_NGEiovonizhKpo9VVS78TzFgx
     kIdrecRezsZ-1kYd_s1qDbxtkDEgfAITAG9LUnADun4vIcb6yelxk",
          "dp":"G4sPXkc6Ya9y8oJW9_ILj4xuppu0lzi_H7VTkS8xj5SdX3coE0oim
     YwxIi2emTAue0UOa5dpgFGyBJ4c8tQ2VF402XRugKDTP8akYhFo5tAA77Qe_Nmtu
     YZc3C3m3I24G2GvR5sSDxUyAN2zq8Lfn9EUms6rY3Ob8YeiKkTiBj0",
          "dq":"s9lAH9fggBsoFR8Oac2R_E2gw282rT2kGOAhvIllETE1efrA6huUU
     vMfBcMpn8lqeW6vzznYY5SSQF7pMdC_agI3nG8Ibp1BUb0JUiraRNqUfLhcQb_d9
     GF4Dh7e74WbRsobRonujTYN1xCaP6TO61jvWrX-L18txXw494Q_cgk",
          "qi":"GyM_p6JrXySiz1toFgKbWV-JdI3jQ4ypu9rbMWx3rQJBfmt0FoYzg
     UIZEVFEcOqwemRN81zoDAaa-Bk0KWNGDjJHZDdDmFhW3AN7lI-puxk_mHZGJ11rx
     yR8O55XLSe3SPmRfKwZI6yU24ZxvQKFYItdldUKGzO6Ia6zTKhAVRU",
          "alg":"RS256",
          "kid":"2011-04-29"}
       ]
     }
```


### Symmetric Keys

The following example JWK Set contains two symmetric keys represented
as JWKs: one designated as being for use with the AES Key Wrap
algorithm and a second one that is an HMAC key.  (Line breaks within
values are for display purposes only.)

```
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
```


# [JWA](https://tools.ietf.org/html/rfc7518)


## Cryptographic Algorithms for Key Management

```
   +--------------------+--------------------+--------+----------------+
   | "alg" Param Value  | Key Management     | More   | Implementation |
   |                    | Algorithm          | Header | Requirements   |
   |                    |                    | Params |                |
   +--------------------+--------------------+--------+----------------+
   | RSA1_5             | RSAES-PKCS1-v1_5   | (none) | Recommended-   |
   | RSA-OAEP           | RSAES OAEP using   | (none) | Recommended+   |
   |                    | default parameters |        |                |
   | RSA-OAEP-256       | RSAES OAEP using   | (none) | Optional       |
   |                    | SHA-256 and MGF1   |        |                |
   |                    | with SHA-256       |        |                |
   | A128KW             | AES Key Wrap with  | (none) | Recommended    |
   |                    | default initial    |        |                |
   |                    | value using        |        |                |
   |                    | 128-bit key        |        |                |
   | A192KW             | AES Key Wrap with  | (none) | Optional       |
   |                    | default initial    |        |                |
   |                    | value using        |        |                |
   |                    | 192-bit key        |        |                |
   | A256KW             | AES Key Wrap with  | (none) | Recommended    |
   |                    | default initial    |        |                |
   |                    | value using        |        |                |
   |                    | 256-bit key        |        |                |
   | dir                | Direct use of a    | (none) | Recommended    |
   |                    | shared symmetric   |        |                |
   |                    | key as the CEK     |        |                |
   | ECDH-ES            | Elliptic Curve     | "epk", | Recommended+   |
   |                    | Diffie-Hellman     | "apu", |                |
   |                    | Ephemeral Static   | "apv"  |                |
   |                    | key agreement      |        |                |
   |                    | using Concat KDF   |        |                |
   | ECDH-ES+A128KW     | ECDH-ES using      | "epk", | Recommended    |
   |                    | Concat KDF and CEK | "apu", |                |
   |                    | wrapped with       | "apv"  |                |
   |                    | "A128KW"           |        |                |
   | ECDH-ES+A192KW     | ECDH-ES using      | "epk", | Optional       |
   |                    | Concat KDF and CEK | "apu", |                |
   |                    | wrapped with       | "apv"  |                |
   |                    | "A192KW"           |        |                |   
   | ECDH-ES+A256KW     | ECDH-ES using      | "epk", | Recommended    |
   |                    | Concat KDF and CEK | "apu", |                |
   |                    | wrapped with       | "apv"  |                |
   |                    | "A256KW"           |        |                |
   | A128GCMKW          | Key wrapping with  | "iv",  | Optional       |
   |                    | AES GCM using      | "tag"  |                |
   |                    | 128-bit key        |        |                |
   | A192GCMKW          | Key wrapping with  | "iv",  | Optional       |
   |                    | AES GCM using      | "tag"  |                |
   |                    | 192-bit key        |        |                |
   | A256GCMKW          | Key wrapping with  | "iv",  | Optional       |
   |                    | AES GCM using      | "tag"  |                |
   |                    | 256-bit key        |        |                |
   | PBES2-HS256+A128KW | PBES2 with HMAC    | "p2s", | Optional       |
   |                    | SHA-256 and        | "p2c"  |                |
   |                    | "A128KW" wrapping  |        |                |
   | PBES2-HS384+A192KW | PBES2 with HMAC    | "p2s", | Optional       |
   |                    | SHA-384 and        | "p2c"  |                |
   |                    | "A192KW" wrapping  |        |                |
   | PBES2-HS512+A256KW | PBES2 with HMAC    | "p2s", | Optional       |
   |                    | SHA-512 and        | "p2c"  |                |
   |                    | "A256KW" wrapping  |        |                |
   +--------------------+--------------------+--------+----------------+
```


## Cryptographic Algorithms for Content Encryption (Symmetric)

```
   +---------------+----------------------------------+----------------+
   | "enc" Param   | Content Encryption Algorithm     | Implementation |
   | Value         |                                  | Requirements   |
   +---------------+----------------------------------+----------------+
   | A128CBC-HS256 | AES_128_CBC_HMAC_SHA_256         | Required       |
   |               | authenticated encryption         |                |
   |               | algorithm, as defined in Section |                |
   |               | 5.2.3                            |                |
   | A192CBC-HS384 | AES_192_CBC_HMAC_SHA_384         | Optional       |
   |               | authenticated encryption         |                |
   |               | algorithm, as defined in Section |                |
   |               | 5.2.4                            |                |
   | A256CBC-HS512 | AES_256_CBC_HMAC_SHA_512         | Required       |
   |               | authenticated encryption         |                |
   |               | algorithm, as defined in Section |                |
   |               | 5.2.5                            |                |
   | A128GCM       | AES GCM using 128-bit key        | Recommended    |
   | A192GCM       | AES GCM using 192-bit key        | Optional       |
   | A256GCM       | AES GCM using 256-bit key        | Recommended    |
   +---------------+----------------------------------+----------------+
```


## Cryptographic Algorithms for Keys (Asymmetric)

```
   +-------------+--------------------------------+--------------------+
   | "kty" Param | Key Type                       | Implementation     |
   | Value       |                                | Requirements       |
   +-------------+--------------------------------+--------------------+
   | EC          | Elliptic Curve [DSS]           | Recommended+       |
   | RSA         | RSA [RFC3447]                  | Required           |
   | oct         | Octet sequence (used to        | Required           |
   |             | represent symmetric keys)      |                    |
   +-------------+--------------------------------+--------------------+
```   
    