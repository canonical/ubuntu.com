/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} input
* @param {string} entry_suffix
* @returns {string}
*/
export function decompress_from_xz_tarball(input: Uint8Array, entry_suffix: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly wire_decompress_from_xz_tarball: (a: number, b: number, c: number) => void;
  readonly new_uint_8_list_0: (a: number) => number;
  readonly free_WireSyncReturnStruct: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly decompress_from_xz_tarball: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly free_zero_copy_buffer_i8: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_i16: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_f32: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_f64: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_u16: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_u32: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_u64: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_i32: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_i64: (a: number, b: number) => void;
  readonly free_zero_copy_buffer_u8: (a: number, b: number) => void;
  readonly store_dart_post_cobject: (a: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

/**
* Synchronously compiles the given `bytes` and instantiates the WebAssembly module.
*
* @param {BufferSource} bytes
*
* @returns {InitOutput}
*/
export function initSync(bytes: BufferSource): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
