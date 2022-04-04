'use strict'

var path = require('path');

import {
    DocumentLink,
    DocumentLinkProvider,
    TextDocument,
    window,
    Uri
} from 'vscode'
import * as util from '../util'

export default class LinkProvider implements DocumentLinkProvider {
    comment_chars: string

    constructor() {
        this.comment_chars = util.comment_chars
    }

    async provideDocumentLinks(doc: TextDocument): Promise<DocumentLink[]> {
        let editor = window.activeTextEditor

        if (editor) {
            const text = doc.getText()

            let regex   = new RegExp(`//@include +['"]?(.+\.jsx)`, 'g')
            let links   = []
            let matches = text.matchAll(regex)            

            for (const match of matches) {                
                let found = match[1]
                let file  = found.replace(/^\s+/, '')

                let i = match.index + (match[0].length - file.length)
                const range = doc.getWordRangeAtPosition(
                    doc.positionAt(i),
                    new RegExp(file)
                )

                let absolutePath = path.dirname(doc.fileName)  + path.sep + file; 

                const CommandUri = Uri.parse(fileUrl(absolutePath))

                let documentlink     = new DocumentLink(range, CommandUri)
                documentlink.tooltip = file

                links.push(documentlink);
            }

            return links
        }
    }
}

// https://stackoverflow.com/questions/20619488/how-to-convert-local-file-path-to-a-file-url-safely-in-node-js
function fileUrl(str) {
    if (typeof str !== 'string') {
        throw new Error('Expected a string');
    }

    var pathName = path.resolve(str).replace(/\\/g, '/');

    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== '/') {
        pathName = '/' + pathName;
    }

    return encodeURI('file://' + pathName);
};