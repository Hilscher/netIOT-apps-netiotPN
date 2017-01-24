/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * The utility functions.
 */

"use strict";

/*
 * Convert a uint8 array to string. 
 *  
 * @buffer {Array} An array of data in uft8 .
 * @return {string} The converted string.
 */
function uint8ArrayToString(buffer) {
  var str = "";
  var ab = new Uint8Array(buffer);
  var abLen = ab.length;
  var CHUNK_SIZE = Math.pow(2, 16);
  var offset, len, subab;
  
  for (offset = 0; offset < abLen; offset += CHUNK_SIZE) {
    len = Math.min(CHUNK_SIZE, abLen-offset);
    subab = ab.subarray(offset, offset+len);
    str += String.fromCharCode.apply(null, subab);
  }
  return str;
}
 
/*
 * Pad leading zeros. 
 *  
 * @str {string} string.
 * @max {number} the number of maximal digitals.
 * @return {string} The string with possible leading zeros.
 */ 
function pad (str, max) {
  return str.length < max ? pad("0" + str, max) : str;
}

/*
 * Pad leading zeros. 
 *  
 * @str {string} string.
 * @max {number} the number of maximal digitals.
 * @return {string} The string with possible leading zeros.
 */
function padEndZeros(str, max) {
  return str.length < max ? padEndZeros(str + "0", max) : str;
}
/**
 * Format date text.
 * 
 * @param {string} date string The date in UTC string format.
 * @param {string} format The format of date time text, e.g. "YYYY-MM-DD"
 *                 DATE: YYYY-MM-DD
 *                 TIME: HH:mm:ss and the rest part in the original string.
 *                 YYYY: Year
 *                 MM: Month
 *                 DD: Day
 *                 HH: Hour
 *                 mm: Minute
 *                 ss: Second
 *                 lll: Millisecond
 *                 uuu: Microsecond
 *                 nnn: Nanosecond
 *                
 *
 * @return {string} timestamp The timestamp in string format.
 */
function formatDate(dateString, format) {

  var result = dateString;

  if (format) {

    var n = dateString.search('T');

    if (n >= 0) {
      var datePart = dateString.substr(0, n);
      var timePart = dateString.substr(n + 1);

      result = format.replace("DATE", datePart);
      result = result.replace("TIME", timePart);
    }
  }

  return result;

  /* TODO: support other format
    var date = new Date(dataString);
    var result = "";
    var us = 0;
    var ns = 0;
  
    if (!format) {
      // Default format: DD-MM-YY HH:mm:ss
      var month = date.getMonth() + 1;
  
      result = pad(date.getDate().toString(), 2) + '-' +
              pad(month.toString(), 2) + '-' +
              date.getFullYear().toString() + '   ' +
              pad(date.getHours().toString(), 2) + ':' +
              pad(date.getMinutes().toString(), 2) + ':' +
              pad(date.getSeconds().toString(), 2);
    }
    else {
     
      var temp = date.getFullYear().toString();  
      result = format.replace("YYYY", temp);
  
      temp = pad(date.getMonth().toString(), 2);
      result = result.replace("MM", temp);
  
      temp = pad(date.getDay().toString(), 2);
      result = result.replace("DD", temp);
  
      temp = pad(date.getHours().toString(), 2);
      result = result.replace("HH", temp);
  
      temp = pad(date.getMinutes().toString(), 2);
      result = result.replace("mm", temp);
  
      temp = pad(date.getSeconds().toString(), 2);
      result = result.replace("ss", temp);
  
      temp = pad(date.getMilliseconds().toString(), 3);
      result = result.replace("lll", temp);
  
      temp = pad(us.toString(), 3);
      result = result.replace("uuu", temp);
  
      temp = pad(ns.toString(), 3)
      result = result.replace("nnn", temp);
    }
   
    return result;
  */
}

/*
 * Pad end zeros. 
 *  
 * @str {string} string.
 * @max {number} the number of maximal digitals.
 * @return {string} The string with possible end zeros.
 */
function padEndZeros(str, max) {
  return str.length < max ? padEndZeros(str + "0", max) : str;
}

/**
 * Convert date to time struct with milliseconds, microsends and nanoseconds.
 * The timestamp is in text format and the unit is nanosecond.
 * 
 * @param {string} dateString The date in UTC string format.
 *                
 *
 * @return {object} The time struct.
 *                  ms: the number of milliseconds since 1970/01/01.
 *                  us: the number of microsends in second fraction.
 *                  ns: the number of nanoseconds in second fraction.
 */
function convertDateToTimeStruct(dateString) {
  var date = new Date(dateString);
  var ms = date.getTime();
  var us = 0;
  var ns = 0;

  if (isNaN(ms)) {
    ms = 0;
  } else {
    var patt = /\.(\d{0,9})/i;
    var texts = dateString.match(patt);

    if (texts && texts[1]) {
      var fraction = texts[1];

      if (fraction.length > 3) {
        var usStr = padEndZeros(fraction.substr(3, 3), 3);

        us = Number(usStr);

        if (fraction.length > 6) {
          var nsStr = padEndZeros(fraction.substr(6, 3), 3);
          ns = Number(nsStr);
        }
      }
    }
  }

  return { ms: ms, us: us, ns: ns };
}


/** compare time structs which format is defined 
 *  in the above function convertDateToTimeStruct().
 * 
 * @param {object} a A time struct.
 * @param {object} b Another time struct.
 *
 * @return {number} 1 if a is larger than b; -1 if b is larger than a; 0 if a and b are equal.
 */
function compareTimestruct(a, b) {

  if (!a && !b) {
    return 0;
  } else if (a && !b) {
    return 1;
  }
  else if (b && !a) {
    return -1;
  }

  var result = 0;

  // Compare millisecond first.
  if (a.ms > b.ms) {
    result = 1;
  } else if (a.ms < b.ms) {
    result = -1;
  } else {
    // Compare microsecond.
    if (a.us > b.us) {
      result = 1;
    } else if (a.us < b.us) {
      result = -1;
    } else {
      // Compare nanosecond.
      if (a.ns > b.ns) {
        result = 1;
      } else if (a.ns < b.ns) {
        result = -1;
      }
    }
  }
  return result;
}

/** compare timestamps.
 * 
 * The timestamp is in text format and the unit is nanosecond.
 * 
 * @param {string} a A timestamp in string format.
 * @param {string} b Another timestamp in string format.
 *
 * @return {number} 1 if a is larger than b; -1 if b is larger than 1; 0 if a and b are equal.
 */
function compareTimestamp(a, b) {
  var result = 0;

  if (a.length > b.length) {
    result = 1;
  } else if (a.length < b.length) {
    result = -1;
  } else {
    var unixDateValueA = 0;
    var unixDateValueB = 0;
    var nsA = 0;
    var nsB = 0;

    if (a.length >= 19) {
      // 19: The time (> 2016 Year) in nanosecond has at least 19 digitals
      //     The last 6 digitals are nanoseconds.
      // Convert timestamp from nanosecond to millisecond.
      unixDateValueA = Number(a.slice(0, a.length - 6));
      nsA = Number(a.slice(a.length - 6, a.length));
    }
    else {
      unixDateValueA = Number(a);
    }

    if (b.length >= 19) {
      unixDateValueB = Number(b.slice(0, b.length - 6));
      nsB = Number(b.slice(a.length - 6, b.length));
    }
    else {
      unixDateValueB = Number(b);
    }

    if (unixDateValueA > unixDateValueB) {
      result = 1;
    } else if (unixDateValueA < unixDateValueB) {
      result = -1;
    } else {
      if (nsA > nsB) {
        result = 1;
      } else if (nsA < nsB) {
        result = -1;
      }
    }
  }
  return result;
}

/**
 * Decode URL.
 * @param {string} url The URL.
 */
function decodeUrl(url) {
  var schema = '';
  var host = '';
  var port = '';
  var deviceUuid = '';

  if (url) {
    var pattSchema = /schema=([A-Z\d\-]{1,})/i;
    var texts = url.match(pattSchema);;

    if (texts && texts[1]) {
      schema = texts[1];
    }

    var pattHost = /host=([A-Z\d\.-_]{1,})/i;
    texts = url.match(pattHost);

    if (texts && texts[1]) {
      host = texts[1];
    }

    var pattPort = /port=([A-Z\d\.-_]{1,})/i;
    texts = url.match(pattPort);

    if (texts && texts[1]) {
      port = texts[1];
    }

    var pattDeviceUuid = /deviceUuid=([A-F\d\-]{4,})/i;
    texts = url.match(pattDeviceUuid);

    if (texts && texts[1]) {
      deviceUuid = texts[1];
    }
  }

  return { schema: schema, host: host, port: port, deviceUuid: deviceUuid };
}
