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
            var output = 'foo("div", null);'
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
        	var output2 = 'foo("a1", null);'
        	var options = {
        		functionName: 'foo',
        	}
            
            expect(compiler(input1, options)).toBe(output1)
            expect(compiler(input2, options)).toBe(output2)
        })

        it('should support self close tag', () => {
            var input = '<input />'
            var output = 'h("input", null);'
            expect(compiler(input)).toBe(output)
        })

        it('should support tag with attributes', () => {
            var input = `<div foo="1" bar="2">test attributes</div>`
            var output = `h("div", ${JSON.stringify({ foo: '1', bar: '2' })}, "test attributes");`
            expect(compiler(input)).toBe(output)
        })

        it('should support self close tag with attributes', () => {
            var input = `<input type="text" foo="1" bar="2" />`
            var attributes = {
                type: 'text',
                foo: '1',
                bar: '2',
            }
            var output = `h("input", ${JSON.stringify(attributes)});`
            expect(compiler(input)).toBe(output)
        })

    })

    describe('works with nest tags', () => {
        it('should parser nest tags currectly', () => {
            var input = `<div><input /></div>`
            var output = `h("div", null, h("input", null));`
            expect(compiler(input)).toBe(output)
        })
        it('should support multiple children', () => {
            var input = `<div><input /><p>another child</p></div>`
            var output = `h("div", null, h("input", null), h("p", null, "another child"));`
            expect(compiler(input)).toBe(output)
        })
        it('should support multiple lines of input', () => {
            var input = `
            <div class="root">
                <h1>my title</h1>
                <p>my paragraph</p>
                <p>next paragraph</p>
                <input data-name="self close tag" />
            </div>
            `.trim()
            var output = `h("div", ${JSON.stringify({ class: 'root' })}, h("h1", null, "my title"), h("p", null, "my paragraph"), h("p", null, "next paragraph"), h("input", ${JSON.stringify({"data-name":"self close tag"})}));`
            expect(compiler(input)).toBe(output)
        })
        it('should support deep nest tags', () => {
            var input = `
            <foo>
                <bar>
                    <foo>
                        <bar>
                            <foo>
                                <bar>parse me!</bar>
                            </foo>
                        </bar>
                    </foo>
                </bar>
            </foo>
            `.trim()
            var output = `h("foo", null, h("bar", null, h("foo", null, h("bar", null, h("foo", null, h("bar", null, "parse me!"))))));`
            expect(compiler(input)).toBe(output)
        })
    })

})
