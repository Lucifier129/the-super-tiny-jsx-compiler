/**
 * super-tiny-jsx-compiler
 */
function parser(input) {
    var current = 0
    var ast = {
        type: 'Program',
        body: [],
    }

    while (current < input.length) {
        var original = current
        current = parseTag(input, current, ast.body)
        if (original === current) {
            throw new Error(`Unexpect token ${input.substr(current)}`)
        }
    }

    return ast
}

var TAG_NAME = /[A-Za-z0-9]/
var ATTR_NAME = /\w/
var SPACE = /\s/

function parseTag(input, current, body) {
    var tag = {
        type: 'Tag',
        name: '',
        attributes: {},
        content: '',
    }

    function throwError() {
        throw new Error(`Invalid tag, ${input.substr(0, current + 1)}...`)
    }

    function ignoreSpace() {
        var char = input[current]
        while (SPACE.test(char)) {
            char = input[++current]
        }
    }

    function parseOpenTag() {
        var char = input[current]

        if (char !== '<') {
            throw new Error(`Open tag should start with <, not [${char}]`)
        }

        // parse open tag name
        while (char = input[++current]) {
            if (TAG_NAME.test(char)) {
                tag.name += char
                continue
            } else if (tag.name === '' || (!SPACE.test(char) && char !== '>')) {
                throwError()
            }
            break
        }

        var signal = parseAttribute()
        while (signal !== false) {
            signal = parseAttribute()
        }

        ignoreSpace()
        char = input[current]

        // parse tag content and close tag
        if (char === '/') {
            char = input[++current]
                // self clost tag
            if (char === '>') {
                body.push(tag)
                return current + 1
            } else {
                throwError()
            }
        } else if (char === '>') {
            parseTagContent(tag)
            parseCloseTag(tag)
        } else {
            throwError()
        }
    }

    function parseAttribute() {
        var attrName = ''
        var attrValue = ''

        ignoreSpace()

        var char = input[current]

        while (char) {
            if (ATTR_NAME.test(char)) {
                attrName += char
                char = input[++current]
                continue
            }
            break
        }

        if (attrName === '') {
            return false
        }

        if (char === '=') {
            char = input[++current]

            if (char !== '"') {
                throw new Error(`Invalid attribute at ${input.substr(0, current + 1)}`)
            }

            char = input[++current]
            while (char !== '"') {
                if (char === undefined) {
                    throw new Error(`Expect " with ${input}`)
                }
                attrValue += char
                char = input[++current]
            }
            char = input[++current]
        }

        tag.attributes[attrName] = attrValue

        ignoreSpace()
    }

    function parseCloseTag() {
        var char = input[current]

        if (char !== '<') {
            throw new Error('Close tag should start with </')
        }

        char = input[++current]

        if (char !== '/') {
            throw new Error('close tag should start with </')
        }

        var value = ''
        while (char = input[++current]) {
            if (TAG_NAME.test(char)) {
                value += char
            } else if (char === '>') {
                break
            } else {
                throw new Error(`Invalid tag name ${value + char}...`)
            }
        }

        if (char !== '>') {
            throw new Error('Close tag should end with >')
        }

        if (tag.name !== value) {
            throw new Error(`Expected the same tag name, but given ${tag.name} and ${value}`)
        }

        body.push(tag)
    }

    function parseTagContent(tag) {
        var char = input[++current]
        while (char !== '<') {
            if (char === undefined) {
                throw new Error(`Expected clost tag`)
            }
            tag.content += char
            char = input[++current]
        }
        return current
    }

    parseOpenTag()
    return current + 1
}

function generateAttributes(attributes) {
    var keys = Object.keys(attributes)
    if (keys.length === 0) {
        return 'null'
    }
    var attrs = keys.reduce(function(obj, key) {
        var value = attributes[key]
        if (value === '') {
            obj[key] = true
        } else {
            obj[key] = value
        }
        return obj
    }, {})
    return JSON.stringify(attrs, null, 2)
}

function codeGenerator(node, options) {
    options = options || { functionName: 'h' }

    switch (node.type) {
        case 'Program':
            return node.body.map(item => codeGenerator(item, options)).join('')
        case 'Tag':
            return `${options.functionName}("${node.name}", ${generateAttributes(node.attributes)}, "${node.content}");`
        default:
            throw new Error(node.type)
    }
}

function compiler(input, options) {
    var ast = parser(input)
    var output = codeGenerator(ast, options)
    return output
}

module.exports = {
    parser: parser,
    codeGenerator: codeGenerator,
    compiler: compiler,
}