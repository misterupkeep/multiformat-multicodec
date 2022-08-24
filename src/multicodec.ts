import type { Block } from "multiformats/block";
import type {
  BlockDecoder,
  BlockEncoder,
  ByteView,
} from "multiformats/codecs/interface";
import type { Hasher } from "multiformats/hashes/hasher";

/**
 * Interface that supports decoding using many decoders
 */
export interface Multidecoder<T = any> {
  addDecoder<Code extends number>(decoder: BlockDecoder<Code, T>): void;
  addHasher<Name extends string, Code extends number>(
    hasher: Hasher<Name, Code>
  ): void;
  /**
   * @param {object} opts
   * @param {number} opts.codec The codec number code with which to decode
   * @param {number} opts.hasher The hasher number code with which to decode
   * @param opts.bytes The u8 array containing the bytes which to decode
   * @throws Will throw if the codec or hasher is missing, or decoding fails
   */
  decode(opts: {
    codec: number;
    hasher: number;
    bytes: ByteView<T>;
  }): Promise<Block<T>>;
}

/**
 * Interface that supports decoding using many encoders
 */
export interface Multiencoder<T = any> {
  addEncoder<Code extends number>(encoder: BlockEncoder<Code, T>): void;
  addHasher<Name extends string, Code extends number>(
    hasher: Hasher<Name, Code>
  ): void;
  /**
   * @param {object} opts
   * @param {number} opts.codec The codec number code with which to encode
   * @param {number} opts.hasher The hasher number code with which to encode
   * @param opts.bytes The u8 array containing the bytes which to decode
   * @throws Will throw if the codec or hasher is missing, or encoding fails
   */
  encode(opts: { codec: number; hasher: number; value: T }): Promise<Block<T>>;
}

/**
 * Interface that supports (de)encoding using many codecs
 */
export interface Multicodec<T = any> extends Multidecoder<T>, Multiencoder<T> {}
