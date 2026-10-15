console.log(global)
import os from "os";

console.log(os.type())
console.log(os.version())
console.log(os.homedir())

import { add, sub, mul, div } from "./math.js"

console.log(add(3, 3));
console.log(sub(5, 3));
console.log(mul(4, 6));
console.log(div(10, 5));