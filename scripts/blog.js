document.write("<script language=javascript src='" + getUrlParam("path") + "'></script>")
//获取指定的URL参数值 
function getUrlParam(paramName) {
    paramValue = "", isFound = !1;
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
}

//获取当前的博客内容
function getBlogContent() {
    var blog = getBlog()
    if (blog != null) {
        document.getElementById('blog').innerHTML =
            marked.parse(blog.content);
        $("title").text(blog.title);
    }
}