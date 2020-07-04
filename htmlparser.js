/**
 * @file HTML parser like HTMLParser with Python.
 * @author tanykazy
 */

const openbracket = "<";
const closebracket = ">";
const startcomment = "<!--";
const endcomment = "-->";
const startdeclare = "<!";
const startendtag = "</";
const closeemptytag = " />";
const space = " ";
const equal = "=";
const doublequote = "\"";
const singlequote = "'";
const newline = "\n";
const whitespace = /[ \n\t\r]/;

/**
 * HTML Parser class able to parse invalid markup.
 * @class
 */
function HtmlParser() {
    this.reset();
}

/**
 * Reset the instance. Loses all unprocessed data.
 * @returns {Object} This object, for chaining.
 */
HtmlParser.prototype.reset = function () {
    this.rawdata = "";
    this.lineno = 1;
    this.position = 0;
    this.offset = 0;
    return this;
}

/**
 * Force processing of all buffered data as if it were followed by an end-of-file mark.
 * @returns {Object} This object, for chaining.
 */
HtmlParser.prototype.close = function () {
    return this;
}

/**
 * Return current line number and position.
 * @returns {Array} list of current line number and position
 */
HtmlParser.prototype.getpos = function () {
    return [this.lineno, this.position];
}

/**
 * This method is called to handle the start of a tag
 * @param {String} tag the name of the tag converted to lower case.
 * @param {Array} attrs a list of (name, value) pairs containing the attributes.
 */
HtmlParser.prototype.handleStarttag = function (tag, attrs) {
}

/**
 * This method is called to handle the end tag of an element
 * @param {String} tag the name of the tag converted to lower case.
 */
HtmlParser.prototype.handleEndtag = function (tag) {
}

/**
 * called when the parser encounters an XHTML-style empty tag
 * @param {String} tag the name of the tag converted to lower case.
 * @param {Array} attrs a list of (name, value) pairs containing the attributes.
 */
HtmlParser.prototype.handleStartendtag = function (tag, attrs) {
    this.handleStarttag(tag, attrs);
    this.handleEndtag(tag);
}

/**
 * This method is called to process arbitrary data
 * @param {String} data text nodes and the content of <script> and <style>
 */
HtmlParser.prototype.handleData = function (data) {
}

/**
 * This method is called when a comment is encountered
 * @param {String} data comment text
 */
HtmlParser.prototype.handleComment = function (data) {
}

/**
 * This method is called to handle an HTML doctype declaration
 * @param {String} decl entire contents of the declaration
 */
HtmlParser.prototype.handleDecl = function (decl) {
}

/**
 * Feed some text to the parser.
 * @param {String} rawdata string composed of tag elements
 * @returns {Object} This object, for chaining.
 */
HtmlParser.prototype.feed = function (rawdata) {
    this.rawdata = this.rawdata + rawdata;
    this.goahead();
    return this;
}

/**
 * Internal -- handle data as far as reasonable.
 * May leave state and data to be processed by a subsequent call.
 * If 'end' is true, force handling all data as if followed by EOF marker.
 * @param {Boolean} end force handling all data
 */
HtmlParser.prototype.goahead = function (end) {
    while (this.offset < this.rawdata.length) {
        let i = this.rawdata.indexOf(openbracket, this.offset);
        if (i < 0) {
            break;
        } else {
            if (i > this.offset) {
                let data = this.rawdata.substring(this.offset, i);
                this.handleData(data);
                this.offset = this.updatepos(this.offset, i);
            } else if (this.rawdata.indexOf(startcomment, i) === i) {
                i = i + startcomment.length;
                let j = this.rawdata.indexOf(endcomment, i);
                if (j < 0) {
                    break;
                } else {
                    let data = this.rawdata.substring(i, j);
                    this.handleComment(data);
                    this.offset = this.updatepos(this.offset, j + endcomment.length);
                }
            } else if (this.rawdata.indexOf(startdeclare, i) === i) {
                i = i + startdeclare.length;
                let j = this.rawdata.indexOf(closebracket, i);
                if (j < 0) {
                    break;
                } else {
                    let decl = this.rawdata.substring(i, j);
                    this.handleDecl(decl);
                    this.offset = this.updatepos(this.offset, j + closebracket.length);
                }
            } else if (this.rawdata.indexOf(startendtag, i) === i) {
                i = i + startendtag.length;
                let j = this.rawdata.indexOf(closebracket, i);
                if (j < 0) {
                    break;
                } else {
                    let tag = this.rawdata.substring(i, j).toLowerCase();
                    this.handleEndtag(tag);
                    this.offset = this.updatepos(this.offset, j + closebracket.length);
                }
            } else {
                i = i + openbracket.length;
                let j = this.rawdata.indexOf(closebracket, i);
                if (j < 0) {
                    break;
                } else {
                    let starttag_text = this.rawdata.substring(i, j);
                    let k = starttag_text.indexOf(space);
                    let tag = "";
                    let attrs = [];
                    if (k < 0) {
                        tag = starttag_text.toLowerCase();
                    } else {
                        tag = starttag_text.substring(0, k).toLowerCase();
                        k = k + space.length;
                        while (k < starttag_text.length) {
                            let c = "";
                            let name = "";
                            let value = "";
                            k = this.skipWhitespace(starttag_text, k);
                            while (k < starttag_text.length) {
                                c = starttag_text.charAt(k);
                                if (c === equal) {
                                    k = k + equal.length;
                                    break;
                                } else {
                                    name = name + c;
                                }
                                k = k + 1;
                            }
                            c = starttag_text.charAt(k);
                            if (c === doublequote) {
                                k = k + doublequote.length;
                                while (k < starttag_text.length) {
                                    c = starttag_text.charAt(k);
                                    if (c === doublequote) {
                                        k = k + doublequote.length;
                                        break;
                                    } else {
                                        value = value + c;
                                    }
                                    k = k + 1;
                                }
                            } else if (c === singlequote) {
                                k = k + singlequote.length;
                                while (k < starttag_text.length) {
                                    c = starttag_text.charAt(k);
                                    if (c === singlequote) {
                                        k = k + singlequote.length;
                                        break;
                                    } else {
                                        value = value + c;
                                    }
                                    k = k + 1;
                                }
                            }
                            name = name.toLowerCase();
                            attrs.push([name, value]);
                        }
                    }
                    this.handleStarttag(tag, attrs);
                    this.offset = this.updatepos(this.offset, j + closebracket.length);
                }
            }
        }
    }
}

/**
 * Internal -- update line number and offset.
 * @param {Number} start start offset
 * @param {Number} end end offset
 */
HtmlParser.prototype.updatepos = function (start, end) {
    if (start < end) {
        let lines = this.rawdata.substring(start, end).split(newline);
        let n = lines.length - 1;
        if (n > 0) {
            this.lineno = this.lineno + n;
        }
        this.position = lines[n].length;
    }
    return end;
}

/**
 * Skip white space and return next offset.
 * @param {String} text target text
 * @param {Number} offset start offset
 * @returns {Number} current offset
 */
HtmlParser.prototype.skipWhitespace = function (text, offset) {
    while (offset < text.length) {
        let c = text.charAt(offset);
        if (/\s/.test(c)) {
            offset = offset + 1;
        } else {
            break;
        }
    }
    return offset;    
}
