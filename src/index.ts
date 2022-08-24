import type { Multicodec } from "./multicodec";
export * from "./multicodec";

import type {
  BlockCodec,
  BlockEncoder,
  BlockDecoder,
  ByteView,
} from "multiformats/codecs/interface";

import * as block from "multiformats/block";

import { sha256 } from "multiformats/hashes/sha2";
import { Hasher } from "multiformats/hashes/hasher";

/**
 * Default implementation of {@link Multicodec}. Works as you'd expect. Includes
 * `sha256` hasher by default.
 */
export class BlockMulticodec<T> implements Multicodec<T> {
  #decoders: { [x: number]: BlockDecoder<any, T> } = {};
  #encoders: { [x: number]: BlockEncoder<any, T> } = {};
  #hashers: { [x: number]: Hasher<any, any> } = {
    [sha256.code]: sha256,
  };

  constructor(
    opts:
      | undefined
      | {
          codecs?: BlockCodec<any, T>[];
          encoders?: BlockEncoder<any, T>[];
          decoders?: BlockDecoder<any, T>[];
          hashers?: Hasher<any, any>[];
        } = {
      codecs: [],
      encoders: [],
      decoders: [],
      hashers: [],
    }
  ) {
    opts?.codecs?.forEach((codec) => this.addCodec(codec));
    opts?.encoders?.forEach((encoder) => this.addEncoder(encoder));
    opts?.decoders?.forEach((decoder) => this.addDecoder(decoder));
    opts?.hashers?.forEach((hasher) => this.addHasher(hasher));
  }

  addCodec<Code extends number>(codec: BlockCodec<Code, T>): void {
    this.addEncoder(codec);
    this.addDecoder(codec);
  }

  addDecoder<Code extends number>(decoder: BlockDecoder<Code, T>): void {
    this.#decoders[decoder.code] = decoder;
  }

  addEncoder<Code extends number>(encoder: BlockEncoder<Code, T>): void {
    this.#encoders[encoder.code] = encoder;
  }

  addHasher<Name extends string, Code extends number>(
    hasher: Hasher<Name, Code>
  ): void {
    this.#hashers[hasher.code] = hasher;
  }

  encode(opts: {
    codec: number;
    hasher: number;
    value: T;
  }): Promise<block.Block<T>> {
    if (!(opts.codec in this.#encoders))
      throw Error(`Unknown codec: 0x${opts.codec.toString(16)}`);

    if (!(opts.hasher in this.#hashers))
      throw Error(`Unknown multihash codec: 0x${opts.hasher.toString(16)}`);

    return block.encode({
      value: opts.value,
      codec: this.#encoders[opts.codec],
      hasher: this.#hashers[opts.hasher],
    });
  }

  decode(opts: {
    codec: number;
    hasher: number;
    bytes: ByteView<T>;
  }): Promise<block.Block<T>> {
    if (!(opts.codec in this.#encoders))
      throw Error(`Unknown codec: 0x${opts.codec.toString(16)}`);

    if (!(opts.hasher in this.#hashers))
      throw Error(`Unknown multihash codec: 0x${opts.hasher.toString(16)}`);

    return block.decode({
      bytes: opts.bytes,
      codec: this.#decoders[opts.codec],
      hasher: this.#hashers[opts.hasher],
    });
  }
}
