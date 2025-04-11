
import { TextEncoder, TextDecoder } from 'node:util';
import { ReadableStream } from 'node:stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;
