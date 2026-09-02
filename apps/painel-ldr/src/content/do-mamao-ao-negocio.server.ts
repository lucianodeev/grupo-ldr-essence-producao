import { gunzipSync } from "node:zlib";
import c1 from "./do-mamao-ao-negocio.chunk1";
import c2 from "./do-mamao-ao-negocio.chunk2";
import c3 from "./do-mamao-ao-negocio.chunk3";
import c4 from "./do-mamao-ao-negocio.chunk4";
import c5 from "./do-mamao-ao-negocio.chunk5";

const TRAINING_GZIP_BASE64 = c1 + c2 + c3 + c4 + c5;

export function getDoMamaoAoNegocioHtml() {
  return gunzipSync(Buffer.from(TRAINING_GZIP_BASE64, "base64")).toString("utf8");
}
