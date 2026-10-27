// Arduino does pre-processing of `*.ino` files to do forward declarations automatically,
// but this can be frustratingly buggy. So to get around it, we put the Arduino source
// code in extensionless files and just do `#include`s.
#include "main"
