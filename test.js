/**
 * test
 */
var expect = require('expect')

var superTinyJSXCompiler = require('./super-tiny-jsx-compiler')
var compiler = superTinyJSXCompiler.compiler

describe('Compiler should turn `input` into `output`', () => {

    describe('works with single tag', () => {
        it('should support custom functionName', () => {
            var input = '<div>test super tiny jsx compiler</div>'
            var output = 'foo("div", null, "test super tiny jsx compiler");'
            var options = {
                functionName: 'foo',
            }
            expect(compiler(input, options)).toBe(output)
        })

        it('should support empty content', () => {
            var input = '<div></div>'
            var output = 'foo("div", null, "");'
            var options = {
                functionName: 'foo',
            }
            expect(compiler(input, options)).toBe(output)
        })

        it('should throw error with invalid tag name', () => {
            try {
                var output = compiler("<a^[]a></a^[]a>", {
                    functionName: "foo"
                })
            } catch (error) {
            	expect(error).toExist()
            }
        })

        it('should support number to be a valid tag name', () => {
        	var input1 = '<1>test number tag name</1>'
        	var output1 = 'foo("1", null, "test number tag name");'
        	var input2 = '<a1></a1>'
        	var output2 = 'foo("a1", null, "");'
        	var options = {
        		functionName: 'foo',
        	}
            
            expect(compiler(input1, options)).toBe(output1)
            expect(compiler(input2, options)).toBe(output2)
        })

        it('should support self close tag', () => {
            var input = '<input />'
            var output = 'h("input", null, "");'
            expect(compiler(input)).toBe(output)
        })

        it('should support tag with attributes', () => {
            var input = `<div foo="1" bar="2">test attributes</div>`
            var output = `h("div", ${JSON.stringify({ foo: '1', bar: '2' }, null, 2)}, "test attributes");`
            expect(compiler(input)).toBe(output)
        })

        it('should support self close tag with attributes', () => {
            var input = `<input type="text" foo="1" bar="2" />`
            var attributes = {
                type: 'text',
                foo: '1',
                bar: '2',
            }
            var output = `h("input", ${JSON.stringify(attributes, null, 2)}, "");`
            expect(compiler(input)).toBe(output)
        })

    })

})
