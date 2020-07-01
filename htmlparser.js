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

class HtmlParser {
    constructor() {
        this.data = "";
        this.offset = 0;
    }
    handleStarttag(tag, attrs) {
        console.log("Start tag: " + tag);
        console.log("Attrs: " + JSON.stringify(attrs));
    }
    handleEndtag(tag) {
        console.log("End tag: " + tag);
    }
    handleStartendtag(tag, attrs) {
        this.handleStarttag(tag, attrs);
        this.handleEndtag(tag);
    }
    handleData(data) {
        console.log("Data: " + data);
    }
    handleComment(data) {
        console.log("Comment: " + data);
    }
    handleDecl(decl) {
        console.log("Declare: " + decl);
    }
    feed(data) {
        this.data = this.data + data;

        while (this.offset < this.data.length) {
            let i = this.data.indexOf(openbracket, this.offset);
            if (i < 0) {
                break;
            } else {
                if (i > this.offset) {
                    let data = this.data.substring(this.offset, i);
                    this.offset = i;
                    this.handleData(data);
                } else if (this.data.indexOf(startcomment, i) === i) {
                    i = i + startcomment.length;
                    let j = this.data.indexOf(endcomment, i);
                    if (j < 0) {
                        break;
                    } else {
                        let data = this.data.substring(i, j);
                        this.offset = j + endcomment.length;
                        this.handleComment(data);
                    }
                } else if (this.data.indexOf(startdeclare, i) === i) {
                    i = i + startdeclare.length;
                    let j = this.data.indexOf(closebracket, i);
                    if (j < 0) {
                        break;
                    } else {
                        let decl = this.data.substring(i, j);
                        this.offset = j + closebracket.length;
                        this.handleDecl(decl);
                    }
                } else if (this.data.indexOf(startendtag, i) === i) {
                    i = i + startendtag.length;
                    let j = this.data.indexOf(closebracket, i);
                    if (j < 0) {
                        break;
                    } else {
                        let tag = this.data.substring(i, j).toLowerCase();
                        this.offset = j + closebracket.length;
                        this.handleEndtag(tag);
                    }
                } else {
                    i = i + openbracket.length;
                    let j = this.data.indexOf(closebracket, i);
                    if (j < 0) {
                        break;
                    } else {
                        let starttag_text = this.data.substring(i, j);
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
                                }
                                attrs.push([name, value]);
                            }
                        }
                        this.offset = j + closebracket.length;
                        this.handleStarttag(tag, attrs);
                    }
                }
            }
        }
    }
}
