const clientID = '1123581321';
const userID = '12624120';
const granteeID = '31415926';
const privateClientUserJWK = { alg: 'RSA-OAEP-256', key: '0x6f98b5d235160fecc2e25ee936b72baa' };
const publicGranteeJWK = { alg: 'RSA-OAEP-256', key: '0x1a04c9d235160fecc2e25ee936b72bad', type: 'public' };
const distributedKeyJWK = { alg: 'RSA-OAEP-256', key: '0x0104e8509268bb285b37594ebab6e605' };
const commonKey = { alg: 'AES-GCM', key: '0xcd4c547729e999147b396cde9ec31e5a' };
const dataKey = { alg: 'AES-GCM', key: '0xcc5a547729e999147b396cde9ec31e5b' };
const encryptedDataKey = '0xb2ad505840140c5c47422aa96786903b';
const data = '205fc68493ad5f7a3af17e25cf063f04'
    + '1294c81ca789ecc20cc31993b79fc182'
    + 'e1ac510901414d7d653938af11853689'
    + '8cf0363af01bf5d5e249236122752b21'
    + 'b1ad505840140c5c47422aa96786903b'
    + 'd0ac194d493dc4d24d8efb63d3ca198b'
    + '81897937be12fa5549c82059cc1d48c5'
    + 'b3fcd06fdce8f0f9dd9408e4e1d51058'
    + '9dbbbf194e7d7b65f356399e018aa3df'
    + '67687071e04646f7d51f329c85bcd7e4'
    + '10a6a2be46da2d9a207a1803e6d3a22c'
    + '9935bc225cfba2ba8b47d730a4dad2aa'
    + '7af18d49a919082d3b88d5eed234478c'
    + '1f14fd4f9f4f98168746ed6668b10ae5'
    + '581027b9732497500941f588c563377a'
    + '12b423291d124506357fc0ce88c03efb';
const encryptedData = 'bdc6df3dc62305ba3272e91b622dd7f5'
    + '8371106dc96c9936b1d8590f0b5f02ce'
    + 'f0790b96e9fce51fbbf7f3731e403894'
    + '39ca5eec7c1ef639166f1e0e8704d9c4'
    + '314016ac160a47e9eadc95dfd970527f'
    + '020821b81140953185f80d7f2838a5c5'
    + '60111c393c260229cab2c764ef9445f3'
    + '72620d782a55a4b2a0301cefbab8b2ab'
    + '0b1f3045f56a230ea9f7d4a6bddb4fb2'
    + 'aafc1e78ff76854cf0dc15b660b28170'
    + 'f9feb48f7c3dbb7e533b0dbbee779d6c'
    + '9024ccaecc2fe81db8f18a46d4ee762f'
    + '67af70bf732d5778c9a5d3e1da543bee'
    + '4a7e1db642407525872b533aca503ee1'
    + '9d00f49ad35b281c58fda22c1b615dff'
    + 'b2a33ead13d2c0420de94f4df770de2d';

export default {
    clientID,
    userID,
    granteeID,
    privateClientUserJWK,
    publicGranteeJWK,
    distributedKeyJWK,
    commonKey,
    dataKey,
    encryptedDataKey,
    data,
    encryptedData,
};
