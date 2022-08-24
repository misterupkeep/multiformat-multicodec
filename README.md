# multiformat-multicodec

An interface for encoding/decoding across multiple multiformat [BlockEncoders, BlockDecoders, BlockCodecs](https://github.com/multiformats/js-multiformats/blob/master/src/codecs/interface.ts), and [Hashers](https://github.com/multiformats/js-multiformats/blob/master/src/hashes/hasher.js#L22).

This interface lets library authors expose a dynamic dependency injection system to their users, so as to not be locked into any particular suite of codecs/hashers -- much like the [IPFS modular interfaces](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core). The library also provides a default trivial implementation of the interfaces.

If you need to decode blocks which may come encoded using many different codecs,
or need your library users to give you the codecs and hashers they want you to
use, this is probably what you're looking for.

## Interfaces

The library exports three interfaces which encapsulate the notion of
(de)encoding for given codec and hasher codes:

`Multidecoder` is an interface that can decode using multiple decoders/hashers:
```ts
interface Multidecoder {
  addDecoder(decoder: BlockDecoder): void;
  addHasher(hasher: Hasher): void;
  decode(opts: {
    codec: number;
    hasher: number;
    bytes: ByteView<T>;
  }): Promise<Block<T>>;
}
```

`Multiencoder` is its dual, and can encode using multiple encoders/hashers (you pick which one):
```ts
interface Multiencoder {
  addEncoder(encoder: BlockEncoder): void;
  addHasher(hasher: Hasher): void;
  encode(opts: { codec: number; hasher: number; value: T }): Promise<Block<T>>;
}
```

If you need both interfaces simultaneously, the `Multicodec` interface simply extends the two:
```ts
interface Multicodec extends Multidecoder, Multiencoder {}
```

## Implementation

The library also exports a default implementation of `Multicodec`, called
`BlockMulticodec`. By default, it already has `sha256` hasher support. It has an
extra method `addCodec()` which isn't in the `Multicodec` interface.

```ts
import { BlockMulticodec, Multidecoder } from "multiformat-multicodec";

import { CID } from "multiformats";

import * as json from "@ipld/dag-json";
import * as cbor from "@ipld/dag-cbor";
import * as pb from "@ipld/dag-pb";

const multidecoder = new BlockMulticodec<any>({
  codecs: [json, cbor, pb],
});

const cid = CID.parse("QmQy6xmJhrcC5QLboAcGFcAE1tC8CrwDVkrHdEYJkLscrQ");

await multidecoder.decode({
  codec: cid.code,
  hasher: cid.multihash.code,
  block.get(cid),
});
```
