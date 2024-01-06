// 获取所有文章标题，并向文章列表中插入
function insertBlogTitles(blogs) {
    $("#blogs").empty()
    if (blogs == null) {
        blogs = getAllBlogs()
    }
    if (blogs != null && blogs.length > 0) {
        for(var i=blogs.length-1;i>=0;i--){
            var blog = blogs[i]
            var title = blog.title
            var element = '' +
            '<a href="./blog.html?path=' + blog.path + '" target="_blank" class="list-group-item">' +
            '<p class="list-group-item-heading"' +
            'title="'+title+'"' +
            'style="margin-top: 10px;font-size: 20px;color: #428bca;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">' +
            title +
            '</p>' +
            '</a>'
            $("#blogs").append(element)
        }
    } else {
        var element = '' +
            '<div style="text-align:center;margin-top:20px;">找不到任何文章</div>'
        $("#blogs").append(element)
    }
}

// 获取所有文章标签，并向分类标签显示框中插入
function insertBlogTags() {
    var blogs = getAllBlogs()
    var existTags = {}
    if (blogs != null && blogs.length > 0) {
        blogs.forEach(blog => {
            var tag = blog.tag
            if(existTags[tag] == null){
                var tagStr = tag.slice(1, tag.length - 1)
                var element = '' +
                '<button type="button" class="btn btn-outline-secondary btn-sm" onclick="searchBlogByTag($(this))" style="margin-top:5px;margin-left:5px" title="' + tagStr + '">' +
                tagStr +
                '</button>'
                $("#tags").append(element)
                existTags[tag] = tag
            }
        });
    } else {
        var element = '' +
            '<div style="text-align:center;margin-top:20px;">找不到任何分类标签</div>'
        $("#tags").append(element)
    }
}

// 点击搜索按钮时调用
function searchClick() {
    searchBlogByTitle($("#searchInput").val())
}

// 根据文章标题搜索文章，并向文章列表中插入所有满足条件的文章标题
// str : 搜索的字符串
function searchBlogByTitle(str) {
    var searchedBlogs = []
    var blogs = getAllBlogs()
    if (str == null || str == "") {
        searchedBlogs = blogs
    } else if (blogs != null && blogs.length > 0) {
        blogs.forEach(blog => {
            var title = blog.title.toUpperCase()
            str = str.toUpperCase()
            if (title.indexOf(str) != -1) {
                searchedBlogs.push(blog)
            }
        });
    }
    insertBlogTitles(searchedBlogs)
}

// 根据文章标签搜索文章，并向文章列表中插入所有满足条件的文章标题
// str : 搜索的标签字符串
function searchBlogByTag(tagElement) {
    $("#tags").find("button").attr("class","btn btn-outline-secondary btn-sm")
    tagElement.attr("class", "btn btn-primary btn-sm")
    var tag = tagElement.text()
    var searchedBlogs = []
    var blogs = getAllBlogs()
    if(tag == "全部分类"){
        searchedBlogs = blogs
    }else if (blogs != null && blogs.length > 0) {
        blogs.forEach(blog => {
            if ("【" + tag + "】" == blog.tag) {
                searchedBlogs.push(blog)
            }
        });
    }
    insertBlogTitles(searchedBlogs)
}
