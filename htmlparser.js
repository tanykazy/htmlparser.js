const openbracket = "<";
const closebracket = ">";
const startcomment = "<!--";
const endcomment = "-->";
const startdeclare = "<!";
const startendtag = "</";
const closeemptytag = " />";
const whitespace = " ";
const equal = "=";
const doublequote = "\"";
const singlequote = "'";

let data_ = "";
let lineno_ = 1;
let offset_ = 0;

/**
 * Reset the instance. Loses all unprocessed data.
 */
function reset() {
    data_ = "";
    lineno_ = 1;
    offset_ = 0;
    return this;
};

/**
 * Force processing of all buffered data as if it were followed by an end-of-file mark.
 */
function close() {
    return this;
};

/**
 * Return current line number and offset.
 */
function getpos() {
    return [lineno_, offset_];
};

/**
 * This method is called to handle the start of a tag
 * @param {String} tag the name of the tag converted to lower case.
 * @param {Array} attrs a list of (name, value) pairs containing the attributes.
 */
function handleStarttag(tag, attrs) {
};

/**
 * This method is called to handle the end tag of an element
 * @param {String} tag the name of the tag converted to lower case.
 */
function handleEndtag(tag) {
};

/**
 * called when the parser encounters an XHTML-style empty tag
 * @param {String} tag the name of the tag converted to lower case.
 * @param {Array} attrs a list of (name, value) pairs containing the attributes.
 */
function handleStartendtag(tag, attrs) {
    this.handleStarttag(tag, attrs);
    this.handleEndtag(tag);
};

/**
 * This method is called to process arbitrary data
 * @param {String} data text nodes and the content of <script> and <style>
 */
function handleData(data) {
};

/**
 * This method is called when a comment is encountered
 * @param {String} data comment text
 */
function handleComment(data) {
};

/**
 * This method is called to handle an HTML doctype declaration
 * @param {String} decl entire contents of the declaration
 */
function handleDecl(decl) {
};

/**
 * Feed some text to the parser.
 * @param {String} data string composed of tag elements
 */
function feed(data) {
    data_ = data_ + data;

    while (offset_ < data_.length) {
        let i = data_.indexOf(openbracket, offset_);
        if (i < 0) {
            break;
        } else {
            if (i > offset_) {
                let data = data_.substring(offset_, i);
                offset_ = i;
                this.handleData(data);
            } else if (data_.indexOf(startcomment, i) === i) {
                i = i + startcomment.length;
                let j = data_.indexOf(endcomment, i);
                if (j < 0) {
                    break;
                } else {
                    let data = data_.substring(i, j);
                    offset_ = j + endcomment.length;
                    this.handleComment(data);
                }
            } else if (data_.indexOf(startdeclare, i) === i) {
                i = i + startdeclare.length;
                let j = data_.indexOf(closebracket, i);
                if (j < 0) {
                    break;
                } else {
                    let decl = data_.substring(i, j);
                    offset_ = j + closebracket.length;
                    this.handleDecl(decl);
                }
            } else if (data_.indexOf(startendtag, i) === i) {
                i = i + startendtag.length;
                let j = data_.indexOf(closebracket, i);
                if (j < 0) {
                    break;
                } else {
                    let tag = data_.substring(i, j).toLowerCase();
                    offset_ = j + closebracket.length;
                    this.handleEndtag(tag);
                }
            } else {
                i = i + openbracket.length;
                let j = data_.indexOf(closebracket, i);
                if (j < 0) {
                    break;
                } else {
                    let starttag_text = data_.substring(i, j);
                    let k = starttag_text.indexOf(whitespace);
                    let tag = "";
                    let attrs = [];
                    if (k < 0) {
                        tag = starttag_text.toLowerCase();
                    } else {
                        tag = starttag_text.substring(0, k).toLowerCase();
                        k = k + whitespace.length;
                        while (k < starttag_text.length) {
                            let c = "";
                            let name = "";
                            let value = "";
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
                            attrs.push([name, value]);
                        }
                    }
                    offset_ = j + closebracket.length;
                    this.handleStarttag(tag, attrs);
                }
            }
        }
    }

    return this;
};
