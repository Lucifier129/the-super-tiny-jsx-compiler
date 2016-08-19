/**
 * super-tiny-jsx-compiler
 */
function tokenizer(input) {
    var current = 0
    var tokens = []
    var length = input.length

    while (current < length) {
        var original = current
        current = matchOpenTag(input, current, tokens)
        current = matchTagContent(input, current, tokens)
        current = matchCloseTag(input, current, tokens)
        if (original === current) {
            throw new Error(`unexpect token ${input.substr(current)}`)
        }
    }

    return tokens
}

var ALPHABETS = /[A-z]/

function matchOpenTag(input, current, tokens) {
    var char = input[current]

    if (char !== '<') {
        throw new Error(`open tag should start with <, not ${char}`)
    }

    var value = ''
    while (ALPHABETS.test(char = input[++current])) {
        value += char
    }

    if (value === '') {
        throw new Error(`expected tag name`)
    }

    if (char !== '>') {
        throw new Error(`open tag should end with >`)
    }

    tokens.push({
        type: 'openTag',
        value: value,
    })

    return current + 1
}

function matchCloseTag(input, current, tokens) {
    var char = input[current]

    if (char !== '<') {
        throw new Error('close tag should start with </')
    }

    char = input[++current]

    if (char !== '/') {
        throw new Error('close tag should start with </')
    }

    var value = ''
    while (ALPHABETS.test(char = input[++current])) {
        value += char
    }

    if (tokens[0].value !== value) {
        throw new Error(`expected the same tag name, but given ${tokens[0].value} and ${value}`)
    }

    if (char !== '>') {
        throw new Error('close tag should end with >')
    }

    tokens.push({
        type: 'closeTag',
        value: value,
    })

    return current + 1
}

function matchTagContent(input, current, tokens) {
    var value = ''
    var char
    while ((char = input[current]) !== '<') {
        value += char
        current += 1
    }
    tokens.push({
        type: 'content',
        value: value,
    })
    return current
}


function parser(tokens) {
    var current = 0

    function walk() {
        var token = tokens[current++]

        if (token.type === 'openTag') {
            return {
                type: 'OpenTag',
                value: token.value,
            }
        }

        if (token.type === 'content') {
            return {
                type: 'Content',
                value: token.value,
            }
        }

        if (token.type === 'closeTag') {
            return {
                type: 'CloseTag',
                value: token.value,
            }
        }
    }

    var ast = {
        type: 'Program',
        body: [],
    }

    while (current < tokens.length) {
        ast.body.push(walk())
    }

    return ast
}

function transformer(ast) {

    var newAst = {
        type: 'Program',
        body: [],
    }

    var current = 0

    while (current < ast.body.length) {
        var node = ast.body[current]
        current += 1
        if (node.type === 'OpenTag') {
            newAst.body.push({
                type: 'TagName',
                value: node.value
            })
        }
        if (node.type === 'Content') {
            newAst.body.push({
                type: 'TagContent',
                value: node.value,
            })
        }
    }

    return newAst
}


function codeGenerator(node, functionName) {
    switch (node.type) {
        case 'Program':
            return node.body.map(item => codeGenerator(item, functionName)).join('')
        case 'TagName':
            return `${functionName}("${node.value}", null, `
        case 'TagContent':
            return `"${node.value}");`
        default:
            throw new Error(node.type)
    }
}

function compiler(input, options) {
    var tokens = tokenizer(input)
    var ast = parser(tokens)
    var newAst = transformer(ast)
    var output = codeGenerator(newAst, options.functionName)

    return output
}

module.exports = {
    tokenizer: tokenizer,
    parser: parser,
    transformer: transformer,
    codeGenerator: codeGenerator,
    compiler: compiler,
}