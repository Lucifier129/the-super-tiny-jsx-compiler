# the-super-tiny-jsx-compiler
the-super-tiny-jsx-compiler, working in process, should not use in production.

## inspiration

This project inspired by [the-super-tiny-compiler](https://github.com/thejameskyle/the-super-tiny-compiler)

## test

```shell
npm test
```

```javascript
var superTinyJSXCompiler = require('./super-tiny-jsx-compiler')
var assert = require('assert')

var compiler = superTinyJSXCompiler.compiler

var input = '<div>test super tiny jsx compiler</div>'
var output1 = 'h("div", null, "test super tiny jsx compiler");'
var output2 = 'React.createElement("div", null, "test super tiny jsx compiler");'

var result1 = compiler(input, {
	functionName: 'h',
})

var result2 = compiler(input, {
	functionName: 'React.createElement',
})

assert.deepStrictEqual(result1, output1, 'Compiler should turn `input` into `output`')
assert.deepStrictEqual(result2, output2, 'Compiler should turn `input` into `output`')

console.log('All Passed!')
```
