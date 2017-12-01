'use strict';


const PROGRESSIVE_KEY = "\n\t \t\n";


function callCallBack(callback, res, isPartial, xmlhttp) {
    if (callback && typeof callback === "function") {
        callback(res, isPartial, xmlhttp);
    }
}

/**
 * Each partial section is delimited by "\n\t \t\n" token preceded by the number of \t equals to the
 * number of "}" after "]" needed to complete the JSON into correct form
 */
function completeJSON(responseText, options) {

    let lastIndex = responseText.lastIndexOf(PROGRESSIVE_KEY);

    if (lastIndex !== -1) {
        if (options.prevLastIndex !== lastIndex) {
            options.prevLastIndex = lastIndex;


            responseText = responseText.substring(0, lastIndex);

            lastIndex--;

            responseText += "]";

            while (lastIndex > 0 && responseText[lastIndex] === "\t") {
                lastIndex--;
                responseText += "}";
            }
            return responseText;
        }
    }
    return null; // did not receive enough data for a (new) slice
}


function onReadyStateChange(xmlhttp, url, params, options) {
    let res;

    if (xmlhttp.readyState === 3 && (options.partial || options.successOrPartial)) {
        //todo check interval
        const prevTime = options.prevTime || 0;
        let now = new Date().getTime();

        // skip accessing to xmlhttp.responseText if min interval has not been reached
        if (prevTime + options.partialMinInterval < now) {
            options.prevTime = now;

            let completedData = completeJSON(xmlhttp.responseText, options);

            if (completedData === null)
                return;

            res = JSON.parse(completedData);

            if (res.success === false)
                return;

            callCallBack(options.partial, res, true, xmlhttp);
            callCallBack(options.successOrPartial, res, true, xmlhttp);
        }

    } else if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
            const responseText = xmlhttp.responseText;
            try {
                res = JSON.parse(responseText);
                if (res.success === false) {
                    if (options.exception)
                        options.exception(res.error, res,xmlhttp);
                } else {
                    callCallBack(options.success, res, false, xmlhttp);
                    callCallBack(options.successOrPartial, res, false, xmlhttp);
                }
            } catch (e) {
                if (options.error)
                    options.error(xmlhttp);
            }
        } else {
            if (options.error)
                options.error(xmlhttp);
        }
    }
}


const getXmlHttp = window.ActiveXObject
    ? function () {
        return new window.ActiveXObject("MSXML2.XMLHTTP.6.0")
    } // Must be "MSXML2.XMLHTTP.6.0" to support partial response
    : function () {
        return new window.XMLHttpRequest()
    };


/**
 * Calls lightlink.io service allowing progressive loading (intermediate callbacks on partial data loaded)
 * @param {string} url The URL to call
 * @param {object} [params] an object containing request parameters
 * @param {object} [options] callbacks and progressive loading options
 * <br/>
 * Valid options are :<ul>
 *     <li><code>partial</code> callback on partial response. Parameters: (data, isPartial /*=true * /, xmlhttp)</li>
 *     <li><code>success</code> callback on successful response. Parameters: (data, isPartial /*=false * /, xmlhttp)</li>
 *     <li><code>successOrPartial</code> callback on successful or partial response. Parameters: (data, isPartial, xmlhttp)</li>
 *     <li><code>error</code> callback on HTTP error ou incorrect JSON response. Parameters: (data, isPartial, xmlhttp)</li>
 *     <li><code>exception</code> callback on caught server side exception: Parameters: (data, xmlhttp)</li>
 *     <li><code>partialSlices</code> The size of partial response slices. Default to :[100,100,100,100,100,500]
 *     meaning 5 times each 100 rows, then each 500 rows until loading ended. Slices should not be too small to avoid too frequent updates that might be not needed. Lower CPU usage</li>
 *     <li><code>partialMinInterval</code> The minimum interval between partial responses. Default to 200 millis.
 *     Allows to reduce client CPU by avoiding too frequent updates, and less frequent xmlhttp.responseText access</li>
 *     </ul>
 */
function lightlink(url, params, options) {

    if (!params)
        params = {};

    const finalOptions = {
        partialMinInterval: 200,
        partialSlices: [100, 100, 100, 100, 100, 500],
    };

    Object.assign(finalOptions, options)

    const xmlhttp = getXmlHttp();

    xmlhttp.onreadystatechange = function () {
        onReadyStateChange(xmlhttp, url, params, finalOptions);
    };

    xmlhttp.open("POST", url, true);

    finalOptions.onBeforeSend && finalOptions.onBeforeSend(xmlhttp, url, params, options);

    if ((finalOptions.partial ||finalOptions.successOrPartial) && finalOptions.partialSlices) {
        params["$lightlink-progressive"] = finalOptions.partialSlices;
    }

    xmlhttp.send(JSON.stringify(params));
}

module.exports = lightlink;