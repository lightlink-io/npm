# npm
NPM client package for LightLink.io

## Exports a function
```
lightlink( [ string ] url, [ Object, optional ] params,   [ Object, optional ] options )
```

Calls lightlink.io service allowing progressive loading (intermediate callbacks on partial data loaded)
### Parameters:
- `url` - The URL to call
- `params` - an object containing request parameters
- `options` - callbacks and progressive loading options 

##### Valid `options` are :
* `partial` callback on partial response. Parameters: (data, isPartial /*=true * /, xmlhttp)
* `success` callback on successful response. Parameters: (data, isPartial /*=false * /, xmlhttp)
* `successOrPartial` callback on successful or partial response. Parameters: (data, isPartial, xmlhttp)
* `error` callback on HTTP error ou incorrect JSON response. Parameters: (data, isPartial, xmlhttp)
* `exception` callback on caught server side exception: Parameters: (data, xmlhttp)
* `partialSlices` The size of partial response slices. Default to :[100,100,100,100,100,500] meaning 5 times each 100 rows, then each 500 rows until loading ended. Slices should not be too small to avoid too frequent updates that might be not needed. Lower CPU usage
* `partialMinInterval` The minimum interval between partial responses. Default to 200 millis. Allows to reduce client CPU by avoiding too frequent updates, and less frequent xmlhttp.responseText access
