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
// const closeemptytag = " />";
const space = " ";
const equal = "=";
const doublequote = "\"";
const singlequote = "'";
const newline = "\n";

const CDATA_CONTENT_ELEMENTS = ["script", "style"];

// const reWhitespace = /[ \n\t\r]/;

// const reOpenbracket = /</;
// const reClosebracket = />/;
// const reStartcomment = /<!--/;
// const reEndcomment = /-->/;
// const reStartdeclare = /<!/;
// const reStartendtag = /<\//;
// const reAttribute = /(?<=)x/;



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
    this.lasttag = "";
    return this;
}

/**
 * Force processing of all buffered data as if it were followed by an end-of-file mark.
 * @returns {Object} This object, for chaining.
 */
HtmlParser.prototype.close = function () {
    this.goahead(true);
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
// HtmlParser.prototype.handleStartendtag = function (tag, attrs) {
//     this.handleStarttag(tag, attrs);
//     this.handleEndtag(tag);
// }

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
    this.goahead(false);
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
        if (CDATA_CONTENT_ELEMENTS.includes(this.lasttag)) {
            let i = this.rawdata.indexOf("</" + this.lasttag + ">", this.offset);
            if (i < 0) {
                break;
            } else {
                let data = this.rawdata.substring(this.offset, i);
                this.offset = this.updatepos(this.offset, i);
                if (data.length > 0) {
                    this.handleData(data);
                }
            }
        }
        let i = this.rawdata.indexOf(openbracket, this.offset);
        if (i < 0) {
            if (end) {
                let length = this.rawdata.length;
                let data = this.rawdata.substring(this.offset, length);
                this.offset = this.updatepos(this.offset, length);
                data = this.stripCollapseWhitespace(data);
                if (data.length > 0) {
                    this.handleData(data);
                }
            }
            break;
        } else {
            if (i > this.offset) {
                let data = this.rawdata.substring(this.offset, i);
                this.offset = this.updatepos(this.offset, i);
                data = this.stripCollapseWhitespace(data);
                if (data.length > 0) {
                    this.handleData(data);
                }
            } else if (this.rawdata.indexOf(startcomment, i) === i) {
                i = i + startcomment.length;
                let j = this.rawdata.indexOf(endcomment, i);
                if (j < 0) {
                    if (end) {
                        let length = this.rawdata.length;
                        let data = this.rawdata.substring(i, length);
                        this.offset = this.updatepos(this.offset, length);
                        this.handleComment(data);
                    }
                    break;
                } else {
                    let data = this.rawdata.substring(i, j);
                    this.offset = this.updatepos(this.offset, j + endcomment.length);
                    this.handleComment(data);
                }
            } else if (this.rawdata.indexOf(startdeclare, i) === i) {
                i = i + startdeclare.length;
                let j = this.rawdata.indexOf(closebracket, i);
                if (j < 0) {
                    if (end) {
                        let length = this.rawdata.length;
                        let data = this.rawdata.substring(i, length);
                        this.offset = this.updatepos(this.offset, length);
                        this.handleDecl(data);
                    }
                    break;
                } else {
                    let decl = this.rawdata.substring(i, j);
                    this.offset = this.updatepos(this.offset, j + closebracket.length);
                    this.handleDecl(decl);
                }
            } else if (this.rawdata.indexOf(startendtag, i) === i) {
                i = i + startendtag.length;
                let j = this.rawdata.indexOf(closebracket, i);
                if (j < 0) {
                    if (end) {
                        let length = this.rawdata.length;
                        let data = this.rawdata.substring(i, length);
                        this.offset = this.updatepos(this.offset, length);
                        this.handleEndtag(data);
                    }
                    break;
                } else {
                    let tag = this.rawdata.substring(i, j).toLowerCase();
                    this.offset = this.updatepos(this.offset, j + closebracket.length);
                    this.handleEndtag(tag);
                    this.lasttag = "";
                }
            } else {
                i = i + openbracket.length;
                j = this.rawdata.indexOf(closebracket, i);
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
                            } else {
                                while (k < starttag_text.length) {
                                    c = starttag_text.charAt(k);
                                    if (c === space) {
                                        k = k + space.length;
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
                    this.offset = this.updatepos(i, j + closebracket.length);
                    this.handleStarttag(tag, attrs);
                    this.lasttag = tag;
                }
            }
        }
    }
    this.rawdata = this.rawdata.substring(this.offset);
    this.offset = 0;
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
 * strip and collapse whitespace in a string.
 * @param {String} text input string
 * @returns {String} result String
 */
HtmlParser.prototype.stripCollapseWhitespace = function (text) {
    return text.replace(/\s+/, " ").trim();
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
