# htmlparser.js

## Overview

HTML parser like HTMLParser with Python.

## Features

Google Apps Script library's script id:`1alVPrF7iZ-VDpBwlNVQr6g3P1IvB9yo_qNBqZGw6_rG0TYs4mDIfpkb9`

## Requirement

ECMAScript 2015

## Usage

```
var htmlParser = new HtmlParser();

// Override the handler methods.
htmlParser.handleStarttag = function(tag, attrs){
  console.log("Encountered a start tag:" + tag);
};

htmlParser.handleEndtag = function(tag){
  console.log("Encountered an end tag:" + tag);
};

htmlParser.handleData = function(data){
  console.log("Encountered some data:" + data);
};

htmlParser.feed("<html><head><title>Test</title></head><body><h1>Parse me!</h1></body></html>");
```

Log:
```
Encountered a start tag:html
Encountered a start tag:head
Encountered a start tag:title
Encountered some data:Test
Encountered an end tag:title
Encountered an end tag:head
Encountered a start tag:body
Encountered a start tag:h1
Encountered some data:Parse me!
Encountered an end tag:h1
Encountered an end tag:body
Encountered an end tag:html
```

## Description

Once the HTML data is entered, it will call the handler method every time it finds a start tag, end tag, and other elements.

## VS. 

HTMLParser with Python

## Install

## Contribution

## Licence

## Author
